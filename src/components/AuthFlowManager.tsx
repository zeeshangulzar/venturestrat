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

  // Check if current route is onboarding
  const isOnboardingRoute = pathname === '/onboarding';

  useEffect(() => {
    if (!isLoaded) {
      setIsProcessingAuth(true);
      return;
    }

    if (user) {
      const onboardingComplete = (user.publicMetadata as { onboardingComplete?: boolean })?.onboardingComplete === true;
      
      if (!onboardingComplete && !isOnboardingRoute) {
        // User needs onboarding but not on onboarding page
        showLoading('Redirecting to onboarding...');
        router.push('/onboarding');
      } else if (onboardingComplete && isOnboardingRoute) {
        // User completed onboarding but on onboarding page
        showLoading('Redirecting to dashboard...');
        router.push('/');
      } else {
        // User is in the right place, hide loading
        hideLoading();
      }
    } else {
      // User is not authenticated
      hideLoading();
    }

    setIsProcessingAuth(false);
  }, [user, isLoaded, router, showLoading, hideLoading, isOnboardingRoute]);

  // Show loading screen while processing authentication, but not on onboarding page
  if (!isLoaded || (isProcessingAuth && !isOnboardingRoute)) {
    return <PageLoader message="Loading authentication..." />;
  }

  return <>{children}</>;
};

export default AuthFlowManager;
