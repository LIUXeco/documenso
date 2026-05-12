import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useRevalidator } from 'react-router';

import { DO_NOT_INVALIDATE_QUERY_ON_MUTATION } from '@documenso/lib/constants/trpc';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import type { TRecipientActionAuth } from '@documenso/lib/types/document-auth';
import { ZInitialsFieldMeta } from '@documenso/lib/types/field-meta';
import { extractInitials } from '@documenso/lib/utils/recipient-formatter';
import type { FieldWithSignature } from '@documenso/prisma/types/field-with-signature';
import { trpc } from '@documenso/trpc/react';
import type {
  TRemovedSignedFieldWithTokenMutationSchema,
  TSignFieldWithTokenMutationSchema,
} from '@documenso/trpc/server/field-router/schema';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { DocumentSigningFieldContainer } from './document-signing-field-container';
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsLoader,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields';
import { useRequiredDocumentSigningContext } from './document-signing-provider';
import { useDocumentSigningRecipientContext } from './document-signing-recipient-provider';
import { useOptimisticFieldSign } from './use-optimistic-field-sign';

export type DocumentSigningInitialsFieldProps = {
  field: FieldWithSignature;
  onSignField?: (value: TSignFieldWithTokenMutationSchema) => Promise<void> | void;
  onUnsignField?: (value: TRemovedSignedFieldWithTokenMutationSchema) => Promise<void> | void;
};

export const DocumentSigningInitialsField = ({
  field,
  onSignField,
  onUnsignField,
}: DocumentSigningInitialsFieldProps) => {
  const { toast } = useToast();
  const { _ } = useLingui();
  const { revalidate } = useRevalidator();

  const { fullName } = useRequiredDocumentSigningContext();
  const { recipient, isAssistantMode } = useDocumentSigningRecipientContext();

  const initials = extractInitials(fullName);

  const { mutateAsync: signFieldWithToken, isPending: isSignFieldWithTokenLoading } =
    trpc.field.signFieldWithToken.useMutation(DO_NOT_INVALIDATE_QUERY_ON_MUTATION);

  const {
    mutateAsync: removeSignedFieldWithToken,
    isPending: isRemoveSignedFieldWithTokenLoading,
  } = trpc.field.removeSignedFieldWithToken.useMutation(DO_NOT_INVALIDATE_QUERY_ON_MUTATION);

  const { effectiveField, markOptimistic, clearOptimistic, isOptimistic } =
    useOptimisticFieldSign(field);

  const isLoading =
    !isOptimistic && (isSignFieldWithTokenLoading || isRemoveSignedFieldWithTokenLoading);

  const safeFieldMeta = ZInitialsFieldMeta.safeParse(field.fieldMeta);
  const parsedFieldMeta = safeFieldMeta.success ? safeFieldMeta.data : null;

  const onSign = async (authOptions?: TRecipientActionAuth) => {
    const value = initials ?? '';

    const payload: TSignFieldWithTokenMutationSchema = {
      token: recipient.token,
      fieldId: field.id,
      value,
      isBase64: false,
      authOptions,
    };

    markOptimistic({ customText: value });

    try {
      if (onSignField) {
        await onSignField(payload);
        return;
      }

      await signFieldWithToken(payload);

      void revalidate();
    } catch (err) {
      clearOptimistic();

      const error = AppError.parseError(err);

      if (error.code === AppErrorCode.UNAUTHORIZED) {
        throw error;
      }

      console.error(err);

      toast({
        title: _(msg`Error`),
        description: isAssistantMode
          ? _(msg`An error occurred while signing as assistant.`)
          : _(msg`An error occurred while signing the document.`),
        variant: 'destructive',
      });
    }
  };

  const onRemove = async () => {
    const previousCustomText = effectiveField.customText;
    clearOptimistic();

    try {
      const payload: TRemovedSignedFieldWithTokenMutationSchema = {
        token: recipient.token,
        fieldId: field.id,
      };

      if (onUnsignField) {
        await onUnsignField(payload);
        return;
      }

      await removeSignedFieldWithToken(payload);

      void revalidate();
    } catch (err) {
      if (previousCustomText) {
        markOptimistic({ customText: previousCustomText });
      }

      console.error(err);

      toast({
        title: _(msg`Error`),
        description: _(msg`An error occurred while removing the field.`),
        variant: 'destructive',
      });
    }
  };

  return (
    <DocumentSigningFieldContainer
      field={effectiveField}
      onSign={onSign}
      onRemove={onRemove}
      type="Initials"
    >
      {isLoading && <DocumentSigningFieldsLoader />}

      {!effectiveField.inserted && (
        <DocumentSigningFieldsUninserted>
          <Trans>Initials</Trans>
        </DocumentSigningFieldsUninserted>
      )}

      {effectiveField.inserted && (
        <DocumentSigningFieldsInserted textAlign={parsedFieldMeta?.textAlign}>
          {effectiveField.customText}
        </DocumentSigningFieldsInserted>
      )}
    </DocumentSigningFieldContainer>
  );
};
