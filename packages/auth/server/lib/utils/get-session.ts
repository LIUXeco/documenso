import type { Session } from '@prisma/client';
import type { Context } from 'hono';

import { AppError } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';

import { AuthenticationErrorCode } from '../errors/error-codes';
import type { SessionValidationResult } from '../session/session';
import { validateSessionToken } from '../session/session';
import { getSessionCookie } from '../session/session-cookies';

export const getSession = async (c: Context | Request) => {
  const { session, user } = await getOptionalSession(mapRequestToContextForCookie(c));

  if (session && user) {
    return { session, user };
  }

  if (c instanceof Request) {
    throw new Error('Unauthorized');
  }

  throw new AppError(AuthenticationErrorCode.Unauthorized);
};

// Per-request cache for session validation. Multiple RR7 loaders (root +
// nested _authenticated layouts) independently call getOptionalSession on
// every page render — without dedup that's a wasted DB round-trip per loader.
// React Router 7 forwards the same Request instance to every loader in a
// render, so a WeakMap keyed by Request is exactly the right granularity:
// concurrent calls share the in-flight promise, and entries are GC'd once
// the response finishes.
const sessionCache = new WeakMap<Request, Promise<SessionValidationResult>>();

const validateRequestSession = async (c: Context | Request): Promise<SessionValidationResult> => {
  const sessionId = await getSessionCookie(mapRequestToContextForCookie(c));

  if (!sessionId) {
    return {
      isAuthenticated: false,
      session: null,
      user: null,
    };
  }

  return await validateSessionToken(sessionId);
};

export const getOptionalSession = async (
  c: Context | Request,
): Promise<SessionValidationResult> => {
  if (c instanceof Request) {
    const cached = sessionCache.get(c);
    if (cached) {
      return cached;
    }

    const promise = validateRequestSession(c);
    sessionCache.set(c, promise);
    return promise;
  }

  return validateRequestSession(c);
};

export type ActiveSession = Omit<Session, 'sessionToken'>;

export const getActiveSessions = async (c: Context | Request): Promise<ActiveSession[]> => {
  const { user } = await getSession(c);

  return await prisma.session.findMany({
    where: {
      userId: user.id,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      updatedAt: true,
      createdAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });
};

/**
 * Todo: (RR7) Rethink, this is pretty sketchy.
 */
const mapRequestToContextForCookie = (c: Context | Request) => {
  if (c instanceof Request) {
    const partialContext = {
      req: {
        raw: c,
      },
    };

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return partialContext as unknown as Context;
  }

  return c;
};
