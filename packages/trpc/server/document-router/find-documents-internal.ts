import type { FindDocumentsTeam } from '@documenso/lib/server-only/document/find-documents';
import { findDocuments } from '@documenso/lib/server-only/document/find-documents';
import { getStats } from '@documenso/lib/server-only/document/get-stats';
import { mapEnvelopesToDocumentMany } from '@documenso/lib/utils/document';

import { getOrganisationSession } from '../organisation-router/get-organisation-session';
import { authenticatedProcedure } from '../trpc';
import {
  ZFindDocumentsInternalRequestSchema,
  ZFindDocumentsInternalResponseSchema,
} from './find-documents-internal.types';

export const findDocumentsInternalRoute = authenticatedProcedure
  .input(ZFindDocumentsInternalRequestSchema)
  .output(ZFindDocumentsInternalResponseSchema)
  .query(async ({ input, ctx }) => {
    const { user, teamId } = ctx;

    const {
      query,
      templateId,
      page,
      perPage,
      orderByDirection,
      orderByColumn,
      source,
      status,
      period,
      senderIds,
      folderId,
    } = input;

    // Resolve the team from the cached organisation session that the auth
    // layout loader fire-and-forgot during SSR. By the time this route runs,
    // the in-process cache is populated, so we avoid two sequential Supabase
    // round trips (`prisma.user.findFirstOrThrow` + `getTeamById`) that
    // findDocuments and getStats would otherwise both run independently.
    let prefetchedTeam: FindDocumentsTeam | null = null;

    if (teamId !== undefined && teamId !== -1) {
      const orgSession = await getOrganisationSession({ userId: user.id });
      const matchedTeam = orgSession.flatMap((org) => org.teams).find((team) => team.id === teamId);

      if (matchedTeam) {
        prefetchedTeam = {
          id: matchedTeam.id,
          teamEmail: matchedTeam.teamEmail ? { email: matchedTeam.teamEmail.email } : null,
          currentTeamRole: matchedTeam.currentTeamRole,
        };
      }
    }

    const prefetchedUser = { id: user.id, email: user.email, name: user.name };

    const [stats, documents] = await Promise.all([
      getStats({
        userId: user.id,
        teamId,
        period,
        search: query,
        folderId,
        senderIds,
        prefetchedUser,
        prefetchedTeam: prefetchedTeam ?? undefined,
      }),
      findDocuments({
        userId: user.id,
        teamId,
        query,
        templateId,
        page,
        perPage,
        source,
        status,
        period,
        senderIds,
        folderId,
        orderBy: orderByColumn ? { column: orderByColumn, direction: orderByDirection } : undefined,
        prefetchedUser,
        // `?? undefined` so a cache miss falls through to findDocuments'
        // built-in `getTeamById` lookup instead of being mistaken for
        // personal mode (which would silently return empty results).
        prefetchedTeam: prefetchedTeam ?? undefined,
      }),
    ]);

    return {
      ...documents,
      data: documents.data.map((envelope) => mapEnvelopesToDocumentMany(envelope)),
      stats,
    };
  });
