-- CreateIndex
-- organisation.member.invite.getMany filters by (email, status) on every
-- inbox page load to surface pending invites for the current user. Without
-- this index Postgres falls back to a seq scan, which can dominate the
-- inbox tRPC batch latency once the table grows.
CREATE INDEX "OrganisationMemberInvite_email_status_idx"
  ON "OrganisationMemberInvite"("email", "status");
