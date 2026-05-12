import { prisma } from '@documenso/prisma';

import { invalidateSiteSettingsCache } from './get-site-settings';
import { type TSiteSettingSchema } from './schema';

export type UpsertSiteSettingOptions = TSiteSettingSchema & {
  userId?: number | null;
};

export const upsertSiteSetting = async ({
  id,
  enabled,
  data,
  userId,
}: UpsertSiteSettingOptions) => {
  const result = await prisma.siteSettings.upsert({
    where: {
      id,
    },
    create: {
      id,
      enabled,
      data,
      lastModifiedByUserId: userId,
      lastModifiedAt: new Date(),
    },
    update: {
      enabled,
      data,
      lastModifiedByUserId: userId,
      lastModifiedAt: new Date(),
    },
  });

  // Bust the in-process getSiteSettings cache so the change takes effect on
  // the next render of the same instance (other Railway replicas will pick
  // it up within the TTL).
  invalidateSiteSettingsCache();

  return result;
};
