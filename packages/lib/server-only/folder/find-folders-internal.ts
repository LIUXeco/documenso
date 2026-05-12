import { EnvelopeType } from '@prisma/client';

import { prisma } from '@documenso/prisma';

import { TEAM_DOCUMENT_VISIBILITY_MAP } from '../../constants/teams';
import type { TFolderType } from '../../types/folder-type';
import { getTeamById } from '../team/get-team';

export interface FindFoldersInternalOptions {
  userId: number;
  teamId: number;
  parentId?: string | null;
  type?: TFolderType;
}

export const findFoldersInternal = async ({
  userId,
  teamId,
  parentId,
  type,
}: FindFoldersInternalOptions) => {
  const team = await getTeamById({ userId, teamId });

  const visibilityFilters = {
    visibility: {
      in: TEAM_DOCUMENT_VISIBILITY_MAP[team.currentTeamRole],
    },
  };

  const whereClause = {
    AND: [
      { parentId },
      {
        OR: [
          { teamId, ...visibilityFilters },
          { userId, teamId },
        ],
      },
    ],
  };

  try {
    const folders = await prisma.folder.findMany({
      where: {
        ...whereClause,
        ...(type ? { type } : {}),
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    if (folders.length === 0) {
      return [];
    }

    // Resolve every folder's counts and subfolders in three batched queries
    // instead of 4 per folder. The legacy implementation was 4N+1 queries
    // for N folders, which on Railway↔Supabase translated to ~3s wall-clock
    // just on round-trip latency for a typical team. Now it's a constant 4
    // queries regardless of folder count.
    const folderIds = folders.map((folder) => folder.id);

    const [documentCountsByFolder, templateCountsByFolder, allSubfolders] = await Promise.all([
      prisma.envelope.groupBy({
        by: ['folderId'],
        where: {
          folderId: { in: folderIds },
          type: EnvelopeType.DOCUMENT,
          deletedAt: null,
        },
        _count: { _all: true },
      }),
      prisma.envelope.groupBy({
        by: ['folderId'],
        where: {
          folderId: { in: folderIds },
          type: EnvelopeType.TEMPLATE,
          deletedAt: null,
        },
        _count: { _all: true },
      }),
      prisma.folder.findMany({
        where: {
          parentId: { in: folderIds },
          teamId,
          ...visibilityFilters,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const docCountByFolder = new Map<string, number>();
    for (const row of documentCountsByFolder) {
      if (row.folderId) {
        docCountByFolder.set(row.folderId, row._count._all);
      }
    }

    const templateCountByFolder = new Map<string, number>();
    for (const row of templateCountsByFolder) {
      if (row.folderId) {
        templateCountByFolder.set(row.folderId, row._count._all);
      }
    }

    const subfoldersByParent = new Map<string, typeof allSubfolders>();
    for (const subfolder of allSubfolders) {
      if (!subfolder.parentId) {
        continue;
      }
      const list = subfoldersByParent.get(subfolder.parentId) ?? [];
      list.push(subfolder);
      subfoldersByParent.set(subfolder.parentId, list);
    }

    return folders.map((folder) => {
      const subfolders = subfoldersByParent.get(folder.id) ?? [];

      return {
        ...folder,
        subfolders: subfolders.map((subfolder) => ({
          ...subfolder,
          subfolders: [],
          _count: { documents: 0, templates: 0, subfolders: 0 },
        })),
        _count: {
          documents: docCountByFolder.get(folder.id) ?? 0,
          templates: templateCountByFolder.get(folder.id) ?? 0,
          subfolders: subfolders.length,
        },
      };
    });
  } catch (error) {
    console.error('Error in findFolders:', error);
    throw error;
  }
};
