import { OrganisationMemberRole, TeamMemberRole } from '@prisma/client';
import { z } from 'zod';

import { zEmail } from '@documenso/lib/utils/zod';

// export const createOrganisationMemberInvitesMeta: TrpcOpenApiMeta = {
//   openapi: {
//     method: 'POST',
//     path: '/organisation/member/create',
//     summary: 'Invite organisation members',
//     description: 'Invite a users to be part of your organisation',
//     tags: ['Organisation'],
//   },
// };

export const ZCreateOrganisationMemberInvitesRequestSchema = z.object({
  organisationId: z.string().describe('The organisation to invite the user to'),
  invitations: z
    .array(
      z.object({
        email: zEmail().trim().toLowerCase(),
        organisationRole: z.nativeEnum(OrganisationMemberRole),
        // Optional team scope: when set, accepting the invite also adds the
        // user to this team with `teamRole`. The team must belong to the
        // organisation the invite is being created in (validated server-side).
        teamId: z.number().int().optional(),
        teamRole: z.nativeEnum(TeamMemberRole).optional(),
      }),
    )
    .min(1)
    .refine(
      (invitations) => {
        const emails = invitations
          .filter((invitation) => invitation.email !== undefined)
          .map((invitation) => invitation.email);

        return new Set(emails).size === emails.length;
      },
      {
        message: 'Emails must be unique, no duplicate values allowed',
      },
    ),
});

export const ZCreateOrganisationMemberInvitesResponseSchema = z.void();

export type TCreateOrganisationMemberInvitesRequestSchema = z.infer<
  typeof ZCreateOrganisationMemberInvitesRequestSchema
>;
