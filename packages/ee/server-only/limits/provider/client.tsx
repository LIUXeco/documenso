import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { isDeepEqual } from 'remeda';

import { getLimits } from '../client';
import { DEFAULT_MINIMUM_ENVELOPE_ITEM_COUNT, FREE_PLAN_LIMITS } from '../constants';
import type { TLimitsResponseSchema } from '../schema';

// Limits change rarely (a new envelope, a subscription tier change). The
// provider used to refetch on every mount + every window focus, which on
// Railway↔Supabase costs ~2.5s each time. Throttle automatic refreshes
// so we don't pay that cost three times in a 40s navigation session.
// Explicit `refreshLimits()` calls (from mutations that change quota
// usage) bypass the throttle.
const LIMITS_AUTO_REFRESH_INTERVAL_MS = 60_000;

export type LimitsContextValue = TLimitsResponseSchema & { refreshLimits: () => Promise<void> };

const LimitsContext = createContext<LimitsContextValue | null>(null);

export const useLimits = () => {
  const limits = useContext(LimitsContext);

  if (!limits) {
    throw new Error('useLimits must be used within a LimitsProvider');
  }

  return limits;
};

export type LimitsProviderProps = {
  initialValue?: TLimitsResponseSchema;

  /**
   * Bypass limits for embed authoring. This is just client side bypass since
   * all embeds should be paid plans.
   */
  disableLimitsFetch?: boolean;
  teamId: number;
  children?: React.ReactNode;
};

export const LimitsProvider = ({
  initialValue = {
    quota: FREE_PLAN_LIMITS,
    remaining: FREE_PLAN_LIMITS,
    maximumEnvelopeItemCount: DEFAULT_MINIMUM_ENVELOPE_ITEM_COUNT,
  },
  disableLimitsFetch,
  teamId,
  children,
}: LimitsProviderProps) => {
  const [limits, setLimits] = useState(() => initialValue);
  // Track when AND for which team the last refresh ran. We need both because
  // navigating between teams legitimately invalidates the throttle — the
  // limits returned for team A say nothing about team B's quota.
  const lastRefreshedRef = useRef<{ at: number; teamId: number | null }>({
    at: 0,
    teamId: null,
  });

  const refreshLimits = useCallback(async () => {
    if (disableLimitsFetch) {
      return;
    }

    const newLimits = await getLimits({ teamId });

    lastRefreshedRef.current = { at: Date.now(), teamId };

    setLimits((oldLimits) => {
      if (isDeepEqual(oldLimits, newLimits)) {
        return oldLimits;
      }

      return newLimits;
    });
  }, [teamId, disableLimitsFetch]);

  const maybeRefreshLimits = useCallback(async () => {
    if (disableLimitsFetch) {
      return;
    }

    const isSameTeam = lastRefreshedRef.current.teamId === teamId;
    const isFresh = Date.now() - lastRefreshedRef.current.at < LIMITS_AUTO_REFRESH_INTERVAL_MS;

    if (isSameTeam && isFresh) {
      return;
    }

    await refreshLimits();
  }, [refreshLimits, disableLimitsFetch, teamId]);

  useEffect(() => {
    void maybeRefreshLimits();
  }, [maybeRefreshLimits]);

  useEffect(() => {
    if (disableLimitsFetch) {
      return;
    }

    const onFocus = () => {
      void maybeRefreshLimits();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [maybeRefreshLimits, disableLimitsFetch]);

  return (
    <LimitsContext.Provider
      value={{
        ...limits,
        refreshLimits,
      }}
    >
      {children}
    </LimitsContext.Provider>
  );
};
