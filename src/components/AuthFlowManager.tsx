'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalLoading } from './GlobalLoadingProvider';
import { fetchUserData } from '@lib/api';

interface AuthFlowManagerProps {
  children: React.ReactNode;
}

const AuthFlowManager: React.FC<AuthFlowManagerProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [hasShownLoading, setHasShownLoading] = useState(false);
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const gmailWatchAttemptRef = useRef<string | null>(null);

  // Check if current route is onboarding or auth-related
  const isOnboardingRoute = pathname === '/onboarding';
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/sso-callback';

  // Fetch onboarding status from backend
  useEffect(() => {
    if (isLoaded && user?.id) {
      const checkOnboardingStatus = async () => {
        try {
          const userData = await fetchUserData(user.id) as { user?: { onboardingComplete?: boolean }; onboardingComplete?: boolean } | null;
          
          if (userData === null) {
            // User doesn't exist in backend yet (new user), needs onboarding
            setOnboardingStatus(false);
            return;
          }
          
          const actualUserData = userData.user || userData;
          const isComplete = actualUserData.onboardingComplete === true;
          setOnboardingStatus(isComplete);
        } catch (error) {
          console.error('Failed to check onboarding status from backend:', error);
          // Fallback to false (needs onboarding) if backend fails
          setOnboardingStatus(false);
        }
      };
      
      checkOnboardingStatus();
    }
  }, [isLoaded, user]);

  // Listen for onboarding completion events
  useEffect(() => {
    const handleOnboardingStart = () => {
      setIsCompletingOnboarding(true);
      // Show loading state immediately when onboarding starts
      showLoading('Completing onboarding...');
    };
    
    const handleOnboardingComplete = () => {
      setIsRedirecting(true);
      // Keep loading state active during redirect with appropriate message
      showLoading('Redirecting to dashboard...');
      // Don't hide loading here - let the redirect complete naturally
    };

    // Listen for custom events from onboarding page
    window.addEventListener('onboarding:start', handleOnboardingStart);
    window.addEventListener('onboarding:complete', handleOnboardingComplete);

    return () => {
      window.removeEventListener('onboarding:start', handleOnboardingStart);
      window.removeEventListener('onboarding:complete', handleOnboardingComplete);
    };
  }, [showLoading]);

  useEffect(() => {
    if (!isLoaded) {
      // Don't show loading on auth routes (sign-in, sign-up, sso-callback)
      if (isAuthRoute) {
        return;
      }
      
      if (!hasShownLoading) {
        showLoading('Checking authentication...');
        setTimeout(() => setHasShownLoading(true), 0);
      }
      setTimeout(() => setIsProcessingAuth(true), 0);
      return;
    }

    // Don't process auth changes while onboarding is being completed or redirecting
    if (isCompletingOnboarding || isRedirecting) {
      return;
    }

    // Show loading while checking onboarding status from backend
    if (user && onboardingStatus === null) {
      if (!hasShownLoading) {
        showLoading('Checking onboarding status...');
        setTimeout(() => setHasShownLoading(true), 0);
      }
      setTimeout(() => setIsProcessingAuth(true), 0);
      return;
    }

    if (user) {
      if (!onboardingStatus && !isOnboardingRoute) {
        // User needs onboarding but not on onboarding page
        if (!hasShownLoading) {
          showLoading('Redirecting to onboarding...');
          setTimeout(() => setHasShownLoading(true), 0);
        }
        setTimeout(() => setIsProcessingAuth(true), 0);
        router.push('/onboarding');
      } else if (onboardingStatus && isOnboardingRoute) {
        // User completed onboarding but on onboarding page
        if (!hasShownLoading) {
          showLoading('Redirecting to dashboard...');
          setHasShownLoading(true);
        }
        setIsProcessingAuth(true);
        setIsRedirecting(true);
        router.push('/');
      } else {
        // User is in the right place, hide loading with a delay to ensure smooth transition
        setTimeout(() => {
          hideLoading();
          setIsProcessingAuth(false);
          setHasShownLoading(false);
        }, 200);
      }
    } else {
      // User is not authenticated
      setTimeout(() => {
        hideLoading();
        setIsProcessingAuth(false);
        setHasShownLoading(false);
      }, 200);
    }

    setIsProcessingAuth(false);
  }, [user, isLoaded, router, showLoading, hideLoading, isOnboardingRoute, isAuthRoute, hasShownLoading, isCompletingOnboarding, isRedirecting, onboardingStatus]);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const metadata =
      (user.publicMetadata as { gmailWatchInitialized?: boolean } | undefined) ?? {};

    if (metadata.gmailWatchInitialized) {
      gmailWatchAttemptRef.current = user.id;
      return;
    }

    if (gmailWatchAttemptRef.current === user.id) {
      return;
    }

    const hasGoogleAccount =
      user.externalAccounts?.some(
        account =>
          account.provider === 'google' ||
          (typeof account.provider === 'string' && account.provider.includes('google')),
      ) ?? false;

    if (!hasGoogleAccount) {
      gmailWatchAttemptRef.current = user.id;
      return;
    }

    const startGmailWatch = async () => {
      try {
        console.log('Initializing Gmail watch for user', user.id);
        const response = await fetch('/api/gmail/watch', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          const details = await response.json().catch(() => ({}));
          console.error('Failed to initialize Gmail watch', details);
          gmailWatchAttemptRef.current = null;
        } else {
          const payload = await response.json().catch(() => null);
          console.log('Gmail watch initialized', payload);
          try {
            await user.reload?.();
          } catch (reloadError) {
            console.warn(
              'Failed to reload user after Gmail watch initialization',
              reloadError,
            );
          }
        }
      } catch (error) {
        console.error('Unexpected error starting Gmail watch', error);
        gmailWatchAttemptRef.current = null;
      }
    };

    gmailWatchAttemptRef.current = user.id;
    void startGmailWatch();
  }, [isLoaded, user]);

  // Show loading screen only when processing authentication, checking onboarding status, or redirecting
  if (!isLoaded || isProcessingAuth || isRedirecting || (user && onboardingStatus === null)) {
    return null; // Let the GlobalLoadingProvider handle the loading display
  }

  // If user has completed onboarding and is on onboarding page, show loading until redirect completes
  if (user && onboardingStatus === true && isOnboardingRoute) {
    return null; // Let the GlobalLoadingProvider handle the loading display
  }

  return <>{children}</>;
};
export default AuthFlowManager;
