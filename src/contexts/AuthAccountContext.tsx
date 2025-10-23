'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { hasVerifiedExternalAccount } from '../utils/externalAccounts';

interface AuthAccountContextType {
  hasAccount: boolean;
  setHasAccount: (hasAccount: boolean) => void;
  checkAuthStatus: () => void;
}

const AuthAccountContext = createContext<AuthAccountContextType | undefined>(undefined);

export const useAuthAccount = () => {
  const context = useContext(AuthAccountContext);
  if (context === undefined) {
    throw new Error('useAuthAccount must be used within an AuthAccountProvider');
  }
  return context;
};

interface AuthAccountProviderProps {
  children: React.ReactNode;
}

export const AuthAccountProvider: React.FC<AuthAccountProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [hasAccount, setHasAccount] = useState(false);

  const checkAuthStatus = () => {
    if (!isLoaded || !user) {
      setHasAccount(false);
      return;
    }

    // Check if user has any verified OAuth connections
    const hasGoogleAccount = hasVerifiedExternalAccount(user.externalAccounts, 'google');
    const hasMicrosoftAccount = hasVerifiedExternalAccount(user.externalAccounts, 'microsoft');

    // User can only have ONE account (either Google OR Microsoft, not both)
    const hasAnyAccount = hasGoogleAccount || hasMicrosoftAccount;
    setHasAccount(hasAnyAccount);
    
    // Log for debugging
    console.log('Auth status check:', {
      userId: user.id,
      hasGoogleAccount,
      hasMicrosoftAccount,
      hasAnyAccount,
      externalAccounts: user.externalAccounts?.map(acc => ({
        provider: acc.provider,
        id: acc.id,
        verificationStatus: acc.verification?.status,
        approvedScopes: acc.approvedScopes,
      }))
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, [user, isLoaded]);

  // Update hasAccount when user signs in/out or connects/disconnects accounts
  useEffect(() => {
    if (isLoaded) {
      checkAuthStatus();
    }
  }, [user?.externalAccounts, isLoaded]);

  const value = {
    hasAccount,
    setHasAccount,
    checkAuthStatus,
  };

  return (
    <AuthAccountContext.Provider value={value}>
      {children}
    </AuthAccountContext.Provider>
  );
};
