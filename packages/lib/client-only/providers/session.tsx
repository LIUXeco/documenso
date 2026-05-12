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
  // When false, the SSR loader did NOT eagerly fetch the user's organisation
  // tree (Phase B defer). The provider triggers an immediate background
  // refresh on mount instead, so the page can paint sooner and the
  // org-dependent UI fills in once the data arrives.
  organisationsHydrated?: boolean;
}

interface SessionContextValue {
  sessionData: AppSession | null;
  isLoadingOrganisations: boolean;
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
    isLoadingOrganisations: context.isLoadingOrganisations,
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

export const SessionProvider = ({
  children,
  initialSession,
  organisationsHydrated = true,
}: SessionProviderProps) => {
  const [session, setSession] = useState<AppSession | null>(initialSession);

  // If the loader didn't hydrate organisations (defer mode), surface a
  // loading flag so org-dependent UI can render a skeleton instead of
  // flashing a "team/org not found" 404 while the client fetches.
  const [isLoadingOrganisations, setIsLoadingOrganisations] = useState(
    Boolean(initialSession && !organisationsHydrated),
  );

  // When orgs are hydrated, treat the loader-provided data as fresh and skip
  // the mount-fire of the navigation effect. When NOT hydrated, set the
  // ref to 0 so the same effect immediately triggers a real fetch.
  const lastRefreshedAtRef = useRef(organisationsHydrated ? Date.now() : 0);

  const location = useLocation();

  const refreshSession = useCallback(async () => {
    setIsLoadingOrganisations(true);

    try {
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
    } finally {
      setIsLoadingOrganisations(false);
    }
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
        isLoadingOrganisations,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
