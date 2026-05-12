-- Composite index for the paginated team-scoped document list. Covers the
-- common WHERE (teamId, folderId, status) + ORDER BY createdAt DESC pattern
-- used by find-documents.ts. The left-prefix is also usable for queries
-- that filter on just teamId or teamId+folderId.
CREATE INDEX IF NOT EXISTS "Envelope_teamId_folderId_status_createdAt_idx"
  ON "Envelope"("teamId", "folderId", "status", "createdAt" DESC);

-- Trigram index for ILIKE %query% search on Envelope.title. Without this the
-- title search in find-documents.ts triggers a sequential scan; with it
-- Postgres uses bitmap index scan via pg_trgm. pg_trgm was already enabled
-- by the optimize_recipient_indexes migration so no extension change here.
CREATE INDEX IF NOT EXISTS "Envelope_title_trgm_idx"
  ON "Envelope" USING GIN ("title" gin_trgm_ops);

-- Composite for "find unsigned non-CC recipients in this envelope" pattern
-- used by complete-document-with-token and the sequential-signing path.
-- The existing (email, signingStatus, envelopeId, role) index is not usable
-- here because email isn't filtered.
CREATE INDEX IF NOT EXISTS "Recipient_envelopeId_signingStatus_role_idx"
  ON "Recipient"("envelopeId", "signingStatus", "role");

-- Composite for audit-log pagination on the per-document view.
CREATE INDEX IF NOT EXISTS "DocumentAuditLog_envelopeId_createdAt_idx"
  ON "DocumentAuditLog"("envelopeId", "createdAt" DESC);

-- Composite for paginated organisation-member lists.
CREATE INDEX IF NOT EXISTS "OrganisationMember_organisationId_createdAt_idx"
  ON "OrganisationMember"("organisationId", "createdAt" DESC);
