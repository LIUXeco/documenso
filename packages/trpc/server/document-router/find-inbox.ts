import type { Envelope, Prisma } from '@prisma/client';
import { DocumentStatus, EnvelopeType, RecipientRole } from '@prisma/client';

import type { FindResultResponse } from '@documenso/lib/types/search-params';
import { mapEnvelopesToDocumentMany } from '@documenso/lib/utils/document';
import { maskRecipientTokensForDocument } from '@documenso/lib/utils/mask-recipient-tokens-for-document';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import { ZFindInboxRequestSchema, ZFindInboxResponseSchema } from './find-inbox.types';

export const findInboxRoute = authenticatedProcedure
  .input(ZFindInboxRequestSchema)
  .output(ZFindInboxResponseSchema)
  .query(async ({ input, ctx }) => {
    const { page, perPage } = input;

    const envelopes = await findInbox({
      user: { id: ctx.user.id, email: ctx.user.email },
      page,
      perPage,
    });

    return {
      ...envelopes,
      data: envelopes.data.map(mapEnvelopesToDocumentMany),
    };
  });

export type FindInboxOptions = {
  // Caller already has the user from the auth context; passing it in avoids
  // a wasted serial DB round-trip per inbox request (the prior implementation
  // re-fetched id/email by primary key before the count+find could start).
  user: { id: number; email: string };
  page?: number;
  perPage?: number;
  orderBy?: {
    column: keyof Omit<Envelope, 'envelope'>;
    direction: 'asc' | 'desc';
  };
};

export const findInbox = async ({ user, page = 1, perPage = 10, orderBy }: FindInboxOptions) => {
  const orderByColumn = orderBy?.column ?? 'createdAt';
  const orderByDirection = orderBy?.direction ?? 'desc';

  const whereClause: Prisma.EnvelopeWhereInput = {
    type: EnvelopeType.DOCUMENT,
    status: {
      not: DocumentStatus.DRAFT,
    },
    deletedAt: null,
    recipients: {
      some: {
        email: user.email,
        role: {
          not: RecipientRole.CC,
        },
      },
    },
  };

  const [data, count] = await Promise.all([
    prisma.envelope.findMany({
      where: whereClause,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      orderBy: {
        [orderByColumn]: orderByDirection,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipients: true,
        team: {
          select: {
            id: true,
            url: true,
          },
        },
        envelopeItems: {
          select: {
            id: true,
            envelopeId: true,
            title: true,
            order: true,
          },
        },
      },
    }),
    prisma.envelope.count({
      where: whereClause,
    }),
  ]);

  const maskedData = data.map((document) =>
    maskRecipientTokensForDocument({
      document,
      user,
    }),
  );

  return {
    data: maskedData,
    count,
    currentPage: Math.max(page, 1),
    perPage,
    totalPages: Math.ceil(count / perPage),
  } satisfies FindResultResponse<typeof data>;
};
