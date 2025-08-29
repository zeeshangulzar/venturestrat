'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalLoading } from './GlobalLoadingProvider';

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

  // Check if current route is onboarding or auth-related
  const isOnboardingRoute = pathname === '/onboarding';
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/sso-callback';

  // Listen for onboarding completion events
  useEffect(() => {
    const handleOnboardingStart = () => {
      setIsCompletingOnboarding(true);
      // Show loading state immediately when onboarding starts
      showLoading('Completing onboarding...');
    };
    
    const handleOnboardingComplete = () => {
      // Keep loading state active during redirect
      showLoading('Redirecting to dashboard...');
      // Add a delay to ensure smooth transition
      setTimeout(() => {
        setIsCompletingOnboarding(false);
        // Don't hide loading here - let the redirect complete naturally
      }, 1000);
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
      if (!hasShownLoading) {
        showLoading('Checking authentication...');
        setHasShownLoading(true);
      }
      setIsProcessingAuth(true);
      return;
    }

    // Don't process auth changes while onboarding is being completed
    if (isCompletingOnboarding) {
      return;
    }

    if (user) {
      const onboardingComplete = (user.publicMetadata as { onboardingComplete?: boolean })?.onboardingComplete === true;
      
      if (!onboardingComplete && !isOnboardingRoute) {
        // User needs onboarding but not on onboarding page
        if (!hasShownLoading) {
          showLoading('Redirecting to onboarding...');
          setHasShownLoading(true);
        }
        setIsProcessingAuth(true);
        router.push('/onboarding');
      } else if (onboardingComplete && isOnboardingRoute) {
        // User completed onboarding but on onboarding page
        if (!hasShownLoading) {
          showLoading('Redirecting to dashboard...');
          setHasShownLoading(true);
        }
        setIsProcessingAuth(true);
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
  }, [user, isLoaded, router, showLoading, hideLoading, isOnboardingRoute, hasShownLoading, isCompletingOnboarding]);

  // Show loading screen only when processing authentication or redirecting
  if (!isLoaded || isProcessingAuth) {
    return null; // Let the GlobalLoadingProvider handle the loading display
  }

  return <>{children}</>;
};

export default AuthFlowManager;
