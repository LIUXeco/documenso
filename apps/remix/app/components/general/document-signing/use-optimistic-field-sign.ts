import { useMemo, useState } from 'react';

import type { FieldWithSignature } from '@documenso/prisma/types/field-with-signature';

/**
 * Optimistic-UI helper for document-signing fields.
 *
 * The legacy flow was: user fills field → `await signFieldWithToken` (~700ms
 * on Railway↔Supabase) → `await revalidate()` re-runs the route loader to
 * pick up the new field state (~1500ms). The signer sees a spinner for the
 * full ~2.2s before the field flips to "inserted" — and on a multi-field
 * form that wait stacks every time they tab to the next input.
 *
 * Optimistic mode lets each field show as inserted the moment the user
 * submits. The mutation still runs in the background, and `revalidate()` is
 * fire-and-forget instead of awaited. If the mutation rejects, the field
 * component calls `clearOptimistic()` to revert and surfaces a toast.
 */
type OptimisticOverride = {
  customText?: string | null;
  signature?: FieldWithSignature['signature'];
};

export const useOptimisticFieldSign = <T extends FieldWithSignature>(field: T) => {
  const [optimistic, setOptimistic] = useState<OptimisticOverride | null>(null);

  const effectiveField = useMemo(() => {
    if (!optimistic) {
      return field;
    }

    return {
      ...field,
      inserted: true,
      customText: optimistic.customText ?? field.customText,
      signature: optimistic.signature ?? field.signature,
    };
  }, [field, optimistic]);

  return {
    /**
     * The field with the optimistic state applied, or the real field if not
     * currently optimistic. Pass this to the rendering components instead of
     * the raw `field` prop.
     */
    effectiveField,
    /**
     * Mark the field as optimistically inserted with the given value. Call
     * this *before* awaiting the mutation so the UI flips instantly.
     */
    markOptimistic: (override: OptimisticOverride) => setOptimistic(override),
    /**
     * Revert the optimistic state. Call this from the mutation's catch
     * branch so a failed save doesn't leave the field in a "saved" state.
     */
    clearOptimistic: () => setOptimistic(null),
    isOptimistic: optimistic !== null,
  };
};
