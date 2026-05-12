import { useCallback, useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Field } from '@prisma/client';
import { FieldType } from '@prisma/client';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { getPdfPagesCount } from '@documenso/lib/constants/pdf-viewer';
import type { TEditorEnvelope } from '@documenso/lib/types/envelope-editor';
import { ZFieldMetaSchema } from '@documenso/lib/types/field-meta';
import { nanoid } from '@documenso/lib/universal/id';

export const ZLocalFieldSchema = z.object({
  // This is the actual ID of the field if created.
  id: z.number().optional(),
  // This is the local client side ID of the field.
  formId: z.string().min(1),
  // This is the ID of the envelope item to put the field on.
  envelopeItemId: z.string(),
  type: z.nativeEnum(FieldType),
  recipientId: z.number(),
  page: z.number().min(1),
  positionX: z.number().min(0),
  positionY: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
  fieldMeta: ZFieldMetaSchema,
});

export type TLocalField = z.infer<typeof ZLocalFieldSchema>;

const ZEditorFieldsFormSchema = z.object({
  fields: z.array(ZLocalFieldSchema),
});

export type TEditorFieldsFormSchema = z.infer<typeof ZEditorFieldsFormSchema>;

type EditorFieldsProps = {
  envelope: TEditorEnvelope;
  handleFieldsUpdate: (fields: TLocalField[]) => unknown;
};

type UseEditorFieldsResponse = {
  localFields: TLocalField[];
  // Imperative getter for the freshest form snapshot. Use inside async
  // callbacks where `localFields` is captured stale in a closure.
  getCurrentFields: () => TLocalField[];

  // Selected field
  selectedField: TLocalField | undefined;
  setSelectedField: (formId: string | null) => void;

  // Field operations
  addField: (field: Omit<TLocalField, 'formId'>) => TLocalField;
  setFieldId: (formId: string, id: number) => void;
  removeFieldsByFormId: (formIds: string[]) => void;
  updateFieldByFormId: (formId: string, updates: Partial<TLocalField>) => void;
  duplicateField: (field: TLocalField, recipientId?: number) => TLocalField;
  duplicateFieldToAllPages: (field: TLocalField, recipientId?: number) => TLocalField[];

  // Field utilities
  getFieldByFormId: (formId: string) => TLocalField | undefined;
  getFieldsByRecipient: (recipientId: number) => TLocalField[];

  // Selected recipient
  selectedRecipient: TEditorEnvelope['recipients'][number] | null;
  setSelectedRecipient: (recipientId: number | null) => void;

  resetForm: (fields?: Field[]) => void;
};

export const useEditorFields = ({
  envelope,
  handleFieldsUpdate,
}: EditorFieldsProps): UseEditorFieldsResponse => {
  const [selectedFieldFormId, setSelectedFieldFormId] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);

  const generateDefaultValues = (fields?: Field[]) => {
    const formFields = (fields || envelope.fields).map(
      (field): TLocalField => ({
        id: field.id,
        formId: nanoid(),
        envelopeItemId: field.envelopeItemId,
        page: field.page,
        type: field.type,
        positionX: Number(field.positionX),
        positionY: Number(field.positionY),
        width: Number(field.width),
        height: Number(field.height),
        recipientId: field.recipientId,
        fieldMeta: field.fieldMeta ? ZFieldMetaSchema.parse(field.fieldMeta) : undefined,
      }),
    );

    return {
      fields: formFields,
    };
  };

  const form = useForm<TEditorFieldsFormSchema>({
    defaultValues: generateDefaultValues(),
    resolver: zodResolver(ZEditorFieldsFormSchema),
  });

  const {
    append,
    remove,
    update,
    fields: localFields,
  } = useFieldArray({
    control: form.control,
    name: 'fields',
    keyName: 'react-hook-form-id',
  });

  const triggerFieldsUpdate = (override?: TLocalField[]) => {
    // Allow the caller to supply the canonical field list. We do this when
    // mutating the form (append/remove/update) right before triggering an
    // autosave, because `form.getValues()` can momentarily lag behind the
    // useFieldArray operation under React 18's batching, which previously
    // caused the very first added field to be saved as an empty list.
    void handleFieldsUpdate(override ?? form.getValues().fields);
  };

  const setSelectedField = (formId: string | null, bypassCheck = false) => {
    if (!formId) {
      setSelectedFieldFormId(null);
      return;
    }

    const foundField = localFields.find((field) => field.formId === formId);
    const recipient = envelope.recipients.find(
      (recipient) => recipient.id === foundField?.recipientId,
    );

    if (recipient) {
      setSelectedRecipient(recipient.id);
    }

    if (bypassCheck) {
      setSelectedFieldFormId(formId);
      return;
    }

    setSelectedFieldFormId(foundField?.formId ?? null);
  };

  const addField = useCallback(
    (fieldData: Omit<TLocalField, 'formId'>): TLocalField => {
      const field: TLocalField = {
        ...fieldData,
        formId: nanoid(12),
        ...restrictFieldPosValues(fieldData),
      };

      append(field);

      // Pass the next field list explicitly. Reading via form.getValues()
      // right after append() can return the pre-append snapshot in React
      // 18's batched render path — this manifested as the first-ever added
      // field being silently saved as an empty array, so the user had to
      // add it again. Dedup by formId so this still works if RHF *has*
      // already propagated the append in newer versions.
      const currentFields = form.getValues().fields;
      const nextFields = currentFields.some((f) => f.formId === field.formId)
        ? currentFields
        : [...currentFields, field];
      triggerFieldsUpdate(nextFields);

      setSelectedField(field.formId, true);
      return field;
    },
    [append, form, triggerFieldsUpdate, setSelectedField],
  );

  const removeFieldsByFormId = useCallback(
    (formIds: string[]) => {
      const indexes = formIds
        .map((formId) => localFields.findIndex((field) => field.formId === formId))
        .filter((index) => index !== -1);

      if (indexes.length > 0) {
        remove(indexes);
        // Filter the same way ourselves so we don't rely on form.getValues()
        // having picked up the remove yet — same React 18 batching race as
        // addField. Otherwise a remove right after an add can resurrect the
        // deleted field on the next save.
        const removedFormIds = new Set(formIds);
        const nextFields = form
          .getValues()
          .fields.filter((field) => !removedFormIds.has(field.formId));
        triggerFieldsUpdate(nextFields);
      }
    },
    [form, localFields, remove, triggerFieldsUpdate],
  );

  const setFieldId = (formId: string, id: number) => {
    const { fields } = form.getValues();

    const index = fields.findIndex((field) => field.formId === formId);

    if (index !== -1) {
      update(index, {
        ...fields[index],
        id,
      });
    }
  };

  const updateFieldByFormId = useCallback(
    (formId: string, updates: Partial<TLocalField>) => {
      const index = localFields.findIndex((field) => field.formId === formId);

      if (index !== -1) {
        const updatedField = {
          ...localFields[index],
          ...updates,
          ...restrictFieldPosValues({ ...localFields[index], ...updates }),
        };

        update(index, updatedField);

        // Same batching guard as addField/removeFieldsByFormId — build the
        // next list from the current form state with our edit applied,
        // rather than trusting form.getValues() to reflect `update()` yet.
        const currentFields = form.getValues().fields;
        const nextFields = currentFields.map((field) =>
          field.formId === formId ? updatedField : field,
        );
        triggerFieldsUpdate(nextFields);
      }
    },
    [form, localFields, update, triggerFieldsUpdate],
  );

  const duplicateField = useCallback(
    (field: TLocalField): TLocalField => {
      const newField: TLocalField = {
        ...structuredClone(field),
        id: undefined,
        formId: nanoid(12),
        recipientId: field.recipientId,
        positionX: field.positionX + 3,
        positionY: field.positionY + 3,
      };

      append(newField);

      // Same batching guard as addField — append the duplicated field
      // explicitly so autosave doesn't fire with the pre-append snapshot.
      const currentFields = form.getValues().fields;
      const nextFields = currentFields.some((f) => f.formId === newField.formId)
        ? currentFields
        : [...currentFields, newField];
      triggerFieldsUpdate(nextFields);

      return newField;
    },
    [append, form, triggerFieldsUpdate],
  );

  const duplicateFieldToAllPages = useCallback(
    (field: TLocalField): TLocalField[] => {
      const totalPages = getPdfPagesCount();
      const newFields: TLocalField[] = [];

      if (totalPages < 1) {
        return newFields;
      }

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        if (pageNumber === field.page) {
          continue;
        }

        const newField: TLocalField = {
          ...structuredClone(field),
          id: undefined,
          formId: nanoid(12),
          page: pageNumber,
        };

        append(newField);
        newFields.push(newField);
      }

      // Build the next list ourselves so the batched appends are all
      // included in the autosave even if RHF's internal state hasn't
      // caught up yet.
      const currentFields = form.getValues().fields;
      const existingIds = new Set(currentFields.map((f) => f.formId));
      const nextFields = [...currentFields, ...newFields.filter((f) => !existingIds.has(f.formId))];
      triggerFieldsUpdate(nextFields);

      return newFields;
    },
    [append, form, triggerFieldsUpdate],
  );

  const getFieldByFormId = useCallback(
    (formId: string): TLocalField | undefined => {
      return localFields.find((field) => field.formId === formId) as TLocalField | undefined;
    },
    [localFields],
  );

  const getFieldsByRecipient = useCallback(
    (recipientId: number): TLocalField[] => {
      return localFields.filter((field) => field.recipientId === recipientId);
    },
    [localFields],
  );

  const selectedRecipient = useMemo(() => {
    return envelope.recipients.find((recipient) => recipient.id === selectedRecipientId) || null;
  }, [selectedRecipientId, envelope.recipients]);

  const selectedField = useMemo(() => {
    return localFields.find((field) => field.formId === selectedFieldFormId);
  }, [selectedFieldFormId, localFields]);

  /**
   * Keep the selected field form ID in sync with the local fields.
   */
  useEffect(() => {
    const foundField = localFields.find((field) => field.formId === selectedFieldFormId);
    setSelectedFieldFormId(foundField?.formId ?? null);
  }, [selectedFieldFormId, localFields]);

  const setSelectedRecipient = (recipientId: number | null) => {
    const foundRecipient = envelope.recipients.find((recipient) => recipient.id === recipientId);

    setSelectedRecipientId(foundRecipient?.id ?? null);
  };

  const resetForm = (fields?: Field[]) => {
    form.reset(generateDefaultValues(fields));
  };

  const getCurrentFields = (): TLocalField[] => form.getValues().fields;

  return {
    // Core state
    localFields,
    getCurrentFields,

    // Field operations
    addField,
    setFieldId,
    removeFieldsByFormId,
    updateFieldByFormId,
    duplicateField,
    duplicateFieldToAllPages,

    // Field utilities
    getFieldByFormId,
    getFieldsByRecipient,

    // Selected field
    selectedField,
    setSelectedField,

    // Selected recipient
    selectedRecipient,
    setSelectedRecipient,

    resetForm,
  };
};

const restrictFieldPosValues = (
  field: Pick<TLocalField, 'positionX' | 'positionY' | 'width' | 'height'>,
) => {
  return {
    positionX: Math.max(0, Math.min(100, field.positionX)),
    positionY: Math.max(0, Math.min(100, field.positionY)),
    width: Math.max(0, Math.min(100, field.width)),
    height: Math.max(0, Math.min(100, field.height)),
  };
};
