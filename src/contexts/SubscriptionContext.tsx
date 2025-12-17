'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@lib/api';
import { usePathname } from 'next/navigation';
interface SubscriptionInfo {
  plan: string;
  planName: string;
  price: number;
  limits: {
    aiDraftsPerDay: number;
    emailsPerDay?: number;
    investorsPerDay?: number;
    emailsPerMonth?: number;
    investorsPerMonth?: number;
  };
  features: {
    showFullContactInfo: boolean;
    advancedFilters: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
  status?: string;
  currentPeriodEnd?: string;
}

interface UsageStats {
  today: {
    aiDraftsUsed: number;
    emailsSent: number;
    investorsAdded: number;
  };
  monthly: {
    emailsSent: number;
    investorsAdded: number;
  };
  subscription: SubscriptionInfo;
}

interface SubscriptionContextType {
  subscriptionInfo: SubscriptionInfo | null;
  usageStats: UsageStats | null;
  isLoading: boolean;
  error: string | null;
  checkSubscription: (action: 'ai_draft' | 'send_email' | 'add_investor' | 'follow_up_email') => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionInfo = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`/api/subscription/info/${user.id}`), {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (response.ok) {
        const info = await response.json();
        setSubscriptionInfo(info);
      }
    } catch (err) {
      console.error('Error fetching subscription info:', err);
      setError('Failed to fetch subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(getApiUrl(`/api/subscription/usage/${user.id}`), {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (response.ok) {
        const stats = await response.json();
        setUsageStats(stats);
      }
    } catch (err) {
      console.error('Error fetching usage stats:', err);
    }
  };

  const checkSubscription = async (action: 'ai_draft' | 'send_email' | 'add_investor' | 'follow_up_email'): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await fetch(getApiUrl('/api/subscription/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      });

      if (response.ok) {
        const validation = await response.json();
        return validation.allowed;
      }
      return false;
    } catch (err) {
      console.error('Error checking subscription:', err);
      return false;
    }
  };

  const refreshSubscription = async () => {
    await Promise.all([fetchSubscriptionInfo(), fetchUsageStats()]);
  };
  const pathname = usePathname();
  
  useEffect(() => {
    if (isLoaded && user?.id) {
      refreshSubscription();
    }
  }, [pathname, isLoaded, user?.id]);

  const value: SubscriptionContextType = {
    subscriptionInfo,
    usageStats,
    isLoading,
    error,
    checkSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
