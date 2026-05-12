import { EnvelopeType, ReadStatus, SendStatus, WebhookTriggerEvents } from '@prisma/client';

import { DOCUMENT_AUDIT_LOG_TYPE } from '@documenso/lib/types/document-audit-logs';
import type { RequestMetadata } from '@documenso/lib/universal/extract-request-metadata';
import { createDocumentAuditLogData } from '@documenso/lib/utils/document-audit-logs';
import { prisma } from '@documenso/prisma';

import type { TDocumentAccessAuthTypes } from '../../types/document-auth';
import {
  ZWebhookDocumentSchema,
  mapEnvelopeToWebhookDocumentPayload,
} from '../../types/webhook-payload';
import { triggerWebhook } from '../webhooks/trigger/trigger-webhook';

export type ViewedDocumentOptions = {
  token: string;
  recipientAccessAuth?: TDocumentAccessAuthTypes[];
  requestMetadata?: RequestMetadata;
};

export const viewedDocument = async ({
  token,
  recipientAccessAuth,
  requestMetadata,
}: ViewedDocumentOptions) => {
  // Pull the recipient AND the data we'd otherwise need a second
  // `envelope.findUniqueOrThrow` for (used to build the DOCUMENT_OPENED
  // webhook payload). Folding them into a single query saves one Railway↔
  // Supabase round trip on every signing-link open.
  const recipient = await prisma.recipient.findFirst({
    where: {
      token,
      envelope: {
        type: EnvelopeType.DOCUMENT,
      },
    },
    include: {
      envelope: {
        include: {
          documentMeta: true,
          recipients: true,
        },
      },
    },
  });

  if (!recipient) {
    return;
  }

  const { envelope } = recipient;

  const wasAlreadyOpened = recipient.readStatus === ReadStatus.OPENED;

  if (wasAlreadyOpened) {
    // Single audit-log write is enough for the revisit path; no state
    // transition, no webhook. Keep it awaited so the audit row lands before
    // the loader continues with status-based redirects.
    await prisma.documentAuditLog.create({
      data: createDocumentAuditLogData({
        type: DOCUMENT_AUDIT_LOG_TYPE.DOCUMENT_VIEWED,
        envelopeId: recipient.envelopeId,
        user: {
          name: recipient.name,
          email: recipient.email,
        },
        requestMetadata,
        data: {
          recipientEmail: recipient.email,
          recipientId: recipient.id,
          recipientName: recipient.name,
          recipientRole: recipient.role,
          accessAuth: recipientAccessAuth ?? [],
        },
      }),
    });

    return;
  }

  // First-open path: persist both audit logs + the recipient state flip in
  // a single transaction (one round trip). DOCUMENT_VIEWED and
  // DOCUMENT_OPENED were previously two separate awaited writes.
  await prisma.$transaction(async (tx) => {
    await tx.documentAuditLog.createMany({
      data: [
        createDocumentAuditLogData({
          type: DOCUMENT_AUDIT_LOG_TYPE.DOCUMENT_VIEWED,
          envelopeId: recipient.envelopeId,
          user: {
            name: recipient.name,
            email: recipient.email,
          },
          requestMetadata,
          data: {
            recipientEmail: recipient.email,
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientRole: recipient.role,
            accessAuth: recipientAccessAuth ?? [],
          },
        }),
        createDocumentAuditLogData({
          type: DOCUMENT_AUDIT_LOG_TYPE.DOCUMENT_OPENED,
          envelopeId: recipient.envelopeId,
          user: {
            name: recipient.name,
            email: recipient.email,
          },
          requestMetadata,
          data: {
            recipientEmail: recipient.email,
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientRole: recipient.role,
            accessAuth: recipientAccessAuth ?? [],
          },
        }),
      ],
    });

    await tx.recipient.update({
      where: {
        id: recipient.id,
      },
      data: {
        // This handles cases where distribution is done manually
        sendStatus: SendStatus.SENT,
        readStatus: ReadStatus.OPENED,
        // Only set sentAt if not already set (email may have been sent before they opened).
        ...(!recipient.sentAt ? { sentAt: new Date() } : {}),
      },
    });
  });

  // Webhook delivery happens over HTTP to an external endpoint — it can
  // take 1-5s. The signer's page render must not wait on it; we already
  // have the data persisted above, so fire-and-forget here. Errors are
  // swallowed so a failing webhook subscriber can't take down the signing
  // flow; observability lives in the webhook delivery logs.
  void triggerWebhook({
    event: WebhookTriggerEvents.DOCUMENT_OPENED,
    data: ZWebhookDocumentSchema.parse(mapEnvelopeToWebhookDocumentPayload(envelope)),
    userId: envelope.userId,
    teamId: envelope.teamId,
  }).catch(() => null);
};
