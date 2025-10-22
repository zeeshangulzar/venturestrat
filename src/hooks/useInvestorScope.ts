'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

const SCOPE_STORAGE_PREFIX = 'neda.investorScope';

export const RANDOM_SCOPE_OPTIONS = [
  'UPDATED_RECENT',
  'EMAIL_HEAVY',
  'EMAIL_LIGHT',
  'NAME_ASC',
  'NAME_DESC',
  'COMPANY_ASC',
  'COUNTRY_ASC',
  'STATE_ASC',
  'CITY_ASC',
] as const;

export type RandomScopeKey = typeof RANDOM_SCOPE_OPTIONS[number];
export type InvestorScopeKey = RandomScopeKey | 'DEFAULT';

export const DEFAULT_SCOPE: InvestorScopeKey = 'DEFAULT';

const isValidScope = (value: string): value is InvestorScopeKey =>
  value === DEFAULT_SCOPE || RANDOM_SCOPE_OPTIONS.includes(value as RandomScopeKey);

const pickRandomScope = (): InvestorScopeKey => {
  const index = Math.floor(Math.random() * RANDOM_SCOPE_OPTIONS.length);
  return RANDOM_SCOPE_OPTIONS[index];
};

const clearStoredScopes = () => {
  if (typeof window === 'undefined') return;

  const keysToClear: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(`${SCOPE_STORAGE_PREFIX}:`)) {
      keysToClear.push(key);
    }
  }
  keysToClear.forEach((key) => window.localStorage.removeItem(key));
};

export const useInvestorScope = () => {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const [scope, setScope] = useState<InvestorScopeKey | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && sessionId) {
      if (typeof window === 'undefined') return;

      const storageKey = `${SCOPE_STORAGE_PREFIX}:${sessionId}`;
      const storedScope = window.localStorage.getItem(storageKey);

      if (storedScope && isValidScope(storedScope)) {
        setScope(storedScope);
      } else {
        const newScope = pickRandomScope();
        window.localStorage.setItem(storageKey, newScope);
        setScope(newScope);
      }
    } else {
      setScope(DEFAULT_SCOPE);
      clearStoredScopes();
    }
  }, [isLoaded, isSignedIn, sessionId]);

  return {
    scope,
    isReady: scope !== null,
  };
};
