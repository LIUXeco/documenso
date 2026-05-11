-- AlterTable
-- Add optional teamId + teamRole columns to OrganisationMemberInvite so an
-- admin can invite a user "to the People team" and the acceptance flow will
-- add them to the team explicitly (instead of relying on the team's
-- inheritMembers flag).
ALTER TABLE "OrganisationMemberInvite"
  ADD COLUMN "teamId" INTEGER,
  ADD COLUMN "teamRole" "TeamMemberRole";

-- AddForeignKey
-- ON DELETE SET NULL so deleting a team while invites are still pending
-- gracefully degrades to an org-only invite instead of cascading the
-- invite itself.
ALTER TABLE "OrganisationMemberInvite"
  ADD CONSTRAINT "OrganisationMemberInvite_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
