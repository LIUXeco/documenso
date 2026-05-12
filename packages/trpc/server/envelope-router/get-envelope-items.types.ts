import { z } from 'zod';

import DocumentDataSchema from '@documenso/prisma/generated/zod/modelSchema/DocumentDataSchema';
import EnvelopeItemSchema from '@documenso/prisma/generated/zod/modelSchema/EnvelopeItemSchema';

export const ZGetEnvelopeItemsRequestSchema = z.object({
  envelopeId: z.string(),
});

export const ZGetEnvelopeItemsResponseSchema = z.object({
  data: EnvelopeItemSchema.pick({
    id: true,
    title: true,
    order: true,
  })
    .extend({
      // `data` and `initialData` are the raw PDF base64 payloads — multiple
      // MB per item. None of the consumers of this route (template-use
      // dialog, envelope-download dialog) read them; they only need the
      // `id` to construct a /api/files download URL. Dropping them off the
      // response saves the same MB-scale transfer time as we already did
      // in envelope.editor.get.
      documentData: DocumentDataSchema.pick({
        type: true,
        id: true,
      }),
    })
    .array(),
});
