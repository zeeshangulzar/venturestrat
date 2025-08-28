'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import PageLoader from './PageLoader';
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if current route is onboarding or auth-related
  const isOnboardingRoute = pathname === '/onboarding';
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/sso-callback';

  useEffect(() => {
    if (!isLoaded) {
      setIsProcessingAuth(true);
      return;
    }

    if (user) {
      const onboardingComplete = (user.publicMetadata as { onboardingComplete?: boolean })?.onboardingComplete === true;
      
      if (!onboardingComplete && !isOnboardingRoute) {
        // User needs onboarding but not on onboarding page
        setIsRedirecting(true);
        showLoading('Redirecting to onboarding...');
        router.push('/onboarding');
      } else if (onboardingComplete && isOnboardingRoute) {
        // User completed onboarding but on onboarding page
        setIsRedirecting(true);
        showLoading('Redirecting to dashboard...');
        router.push('/');
      } else {
        // User is in the right place, hide loading
        hideLoading();
        setIsRedirecting(false);
      }
    } else {
      // User is not authenticated
      hideLoading();
      setIsRedirecting(false);
    }

    setIsProcessingAuth(false);
  }, [user, isLoaded, router, showLoading, hideLoading, isOnboardingRoute]);

  // Show consistent loading screen with white background for all auth states
  if (!isLoaded || isRedirecting) {
    return <PageLoader message="Loading authentication..." />;
  }

  return <>{children}</>;
};

export default AuthFlowManager;
