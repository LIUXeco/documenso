import { prisma } from '@documenso/prisma';

import { ZSiteSettingsSchema } from './schema';

// Site settings change rarely (admin-only mutations through upsertSiteSetting),
// but getSiteSettings runs on every authenticated SSR page render via the
// _authenticated layout loader. Cache the promise in-process with a short
// TTL so we don't pay a Railway↔Supabase round-trip every page load.
// `invalidateSiteSettingsCache()` is called by upsertSiteSetting so admin
// changes propagate immediately on the instance that handled the mutation.
const SITE_SETTINGS_CACHE_TTL_MS = 60_000;

const fetchSiteSettings = async () => {
  const settings = await prisma.siteSettings.findMany();
  return ZSiteSettingsSchema.parse(settings);
};

// `fetchSiteSettings` is an async function so `ReturnType` is already a
// `Promise<…>`; use `Awaited` to get the resolved payload and store the
// in-flight promise under that flat type — otherwise the cache.promise
// type collapses to `Promise<Promise<…>>` and the strict equality check
// in the catch handler trips on a no-overlap error.
let cache: {
  promise: Promise<Awaited<ReturnType<typeof fetchSiteSettings>>>;
  expiresAt: number;
} | null = null;

export const getSiteSettings = async () => {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.promise;
  }

  const promise = fetchSiteSettings().catch((err) => {
    if (cache?.promise === promise) {
      cache = null;
    }
    throw err;
  });

  cache = {
    promise,
    expiresAt: Date.now() + SITE_SETTINGS_CACHE_TTL_MS,
  };

  return promise;
};

export const invalidateSiteSettingsCache = () => {
  cache = null;
};
