import type { TGetOrganisationSessionResponse } from '@documenso/trpc/server/organisation-router/get-organisation-session.types';

// In-process cache of the per-user org/team tree. The full computation lives
// in `@documenso/trpc/server/organisation-router/get-organisation-session`,
// but the cache + invalidation helper sit here so both `packages/lib`
// mutation handlers (create-team, accept-invite, etc.) and the tRPC procedure
// can touch it without creating a `lib → trpc → lib` package import cycle.
//
// Staleness window: a mutation that changes a user's organisation/team
// membership won't be visible for up to TTL ms unless the mutation calls
// `invalidateOrganisationSessionCache(userId)`. Mutation handlers that move
// users in or out of orgs/teams call this explicitly; other mutations
// (cosmetic settings, etc.) tolerate the TTL window.
type CacheEntry = {
  promise: Promise<TGetOrganisationSessionResponse>;
  expiresAt: number;
};

export const ORGANISATION_SESSION_CACHE_TTL_MS = 30_000;

export const organisationSessionCache = new Map<number, CacheEntry>();

export const invalidateOrganisationSessionCache = (userId: number) => {
  organisationSessionCache.delete(userId);
};
