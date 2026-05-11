import { getHighestOrganisationRoleInGroup } from '@documenso/lib/utils/organisations';
import { extractDerivedTeamSettings, getHighestTeamRoleInGroup } from '@documenso/lib/utils/teams';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import type { TGetOrganisationSessionResponse } from './get-organisation-session.types';
import { ZGetOrganisationSessionResponseSchema } from './get-organisation-session.types';

/**
 * Get all the organisations and teams a user belongs to.
 */
export const getOrganisationSessionRoute = authenticatedProcedure
  .output(ZGetOrganisationSessionResponseSchema)
  .query(async ({ ctx }) => {
    return await getOrganisationSession({ userId: ctx.user.id });
  });

export const getOrganisationSession = async ({
  userId,
}: {
  userId: number;
}): Promise<TGetOrganisationSessionResponse> => {
  // 1) Resolve the user's organisation memberships first. Doing this upfront
  // gives us flat `id IN (...)` filters for the heavy queries that follow,
  // instead of the four-levels-deep `some.some.some.some.userId` predicates
  // the previous single mega-query was generating. Those predicates serialise
  // poorly in Postgres on slow links because each EXISTS clause re-traverses
  // User → OrganisationMember → ... per row.
  const memberships = await prisma.organisationMember.findMany({
    where: { userId },
    select: { id: true, organisationId: true },
  });

  if (memberships.length === 0) {
    return [];
  }

  const organisationIds = memberships.map((m) => m.organisationId);
  const memberIds = memberships.map((m) => m.id);

  // 2) Run the two heavy fetches in parallel. Both use the precomputed
  // organisation + member id lists so Postgres can hit the
  // (organisationId, organisationMemberId) indexes directly without
  // re-deriving them from userId on every row.
  const [organisations, teams] = await Promise.all([
    prisma.organisation.findMany({
      where: { id: { in: organisationIds } },
      include: {
        organisationClaim: true,
        organisationGlobalSettings: true,
        subscription: true,
        groups: {
          where: {
            organisationGroupMembers: {
              some: { organisationMemberId: { in: memberIds } },
            },
          },
        },
      },
    }),
    prisma.team.findMany({
      where: {
        organisationId: { in: organisationIds },
        teamGroups: {
          some: {
            organisationGroup: {
              organisationGroupMembers: {
                some: { organisationMemberId: { in: memberIds } },
              },
            },
          },
        },
      },
      include: {
        teamGlobalSettings: true,
        teamEmail: { select: { email: true } },
        teamGroups: {
          where: {
            organisationGroup: {
              organisationGroupMembers: {
                some: { organisationMemberId: { in: memberIds } },
              },
            },
          },
          include: {
            organisationGroup: true,
          },
        },
      },
    }),
  ]);

  // 3) Stitch in-memory: group teams by organisationId so we can attach them
  // to the right organisation when building the response.
  const teamsByOrgId = new Map<string, typeof teams>();
  for (const team of teams) {
    const list = teamsByOrgId.get(team.organisationId) ?? [];
    list.push(team);
    teamsByOrgId.set(team.organisationId, list);
  }

  return organisations.map((organisation) => {
    const { organisationGlobalSettings } = organisation;
    const orgTeams = teamsByOrgId.get(organisation.id) ?? [];

    return {
      ...organisation,
      teams: orgTeams.map((team) => {
        const derivedSettings = extractDerivedTeamSettings(
          organisationGlobalSettings,
          team.teamGlobalSettings,
        );

        return {
          ...team,
          currentTeamRole: getHighestTeamRoleInGroup(team.teamGroups),
          preferences: {
            aiFeaturesEnabled: derivedSettings.aiFeaturesEnabled,
          },
        };
      }),
      currentOrganisationRole: getHighestOrganisationRoleInGroup(organisation.groups),
    };
  });
};
