import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import React from 'react';

import type { Session } from '@prisma/client';
import { useLocation } from 'react-router';

import { authClient } from '@documenso/auth/client';
import type { SessionUser } from '@documenso/auth/server/lib/session/session';
import { trpc } from '@documenso/trpc/client';
import type { TGetOrganisationSessionResponse } from '@documenso/trpc/server/organisation-router/get-organisation-session.types';

import { SKIP_QUERY_BATCH_META } from '../../constants/trpc';

export type AppSession = {
  session: Session;
  user: SessionUser;
  organisations: TGetOrganisationSessionResponse;
};

interface SessionProviderProps {
  children: React.ReactNode;
  initialSession: AppSession | null;
}

interface SessionContextValue {
  sessionData: AppSession | null;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  if (!context.sessionData) {
    throw new Error('Session not found');
  }

  return {
    ...context.sessionData,
    refreshSession: context.refreshSession,
  };
};

export const useOptionalSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useOptionalSession must be used within a SessionProvider');
  }

  return context;
};

// Minimum interval between automatic background session refreshes (on
// navigation or window focus). The SSR loader already produced fresh session
// + organisation data on first mount, and the legacy behaviour of refreshing
// on *every* route change was costing 5+ seconds per navigation (session-json
// ~1.3s + getOrganisationSession ~4s). Explicit `refreshSession()` calls
// after mutations bypass this throttle.
const SESSION_AUTO_REFRESH_INTERVAL_MS = 60_000;

export const SessionProvider = ({ children, initialSession }: SessionProviderProps) => {
  const [session, setSession] = useState<AppSession | null>(initialSession);

  // Initialise to "now" so the first navigation effect doesn't trigger a
  // redundant refetch — the initialSession we received from the loader was
  // freshly produced on the server.
  const lastRefreshedAtRef = useRef(Date.now());

  const location = useLocation();

  const refreshSession = useCallback(async () => {
    const newSession = await authClient.getSession();

    if (!newSession.isAuthenticated) {
      setSession(null);
      return;
    }

    const organisations = await trpc.organisation.internal.getOrganisationSession
      .query(undefined, SKIP_QUERY_BATCH_META.trpc)
      .catch((e) => {
        const errorMessage = typeof e.message === 'string' ? e.message.toLowerCase() : '';

        const isNetworkError =
          errorMessage.includes('networkerror') || errorMessage.includes('failed to fetch');

        // If the error is a transient network/abort error (e.g. page refresh while
        // fetch was in-flight), return null to signal we should skip the state update.
        if (isNetworkError) {
          return null;
        }

        // Todo: (RR7) Log
        return [];
      });

    // Skip session update if the organisation fetch was aborted due to a transient
    // network error (e.g. page refresh while fetch was in-flight).
    if (organisations === null) {
      return;
    }

    lastRefreshedAtRef.current = Date.now();

    setSession({
      session: newSession.session,
      user: newSession.user,
      organisations,
    });
  }, []);

  const maybeRefreshSession = useCallback(async () => {
    if (Date.now() - lastRefreshedAtRef.current < SESSION_AUTO_REFRESH_INTERVAL_MS) {
      return;
    }

    await refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const onFocus = () => {
      void maybeRefreshSession();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [maybeRefreshSession]);

  /**
   * Refresh session in background on navigation (throttled).
   */
  useEffect(() => {
    void maybeRefreshSession();
  }, [location.pathname, maybeRefreshSession]);

  return (
    <SessionContext.Provider
      value={{
        sessionData: session,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
