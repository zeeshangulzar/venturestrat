import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchUserData } from '@lib/api';

export const useAuthState = () => {
  const { user, isLoaded } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);

  // Fetch onboarding status from backend
  useEffect(() => {
    if (isLoaded && user?.id) {
      const checkOnboardingStatus = async () => {
        try {
          const userData = await fetchUserData(user.id) as { user?: { onboardingComplete?: boolean }; onboardingComplete?: boolean };
          const actualUserData = userData.user || userData;
          const isComplete = actualUserData.onboardingComplete === true;
          setOnboardingStatus(isComplete);
        } catch (error) {
          console.error('Failed to check onboarding status from backend:', error);
          // Fallback to Clerk metadata if backend fails
          const fallbackStatus = false; // Fallback to false since we're not using Clerk metadata anymore
          setOnboardingStatus(fallbackStatus);
        }
      };
      
      checkOnboardingStatus();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    // Show loading when user state is changing
    if (!isLoaded) {
      setTimeout(() => {
        setIsAuthenticating(true);
        setAuthMessage('Loading authentication...');
      }, 0);
    } else if (user) {
      // User is authenticated, check onboarding status from backend
      if (onboardingStatus === null) {
        // Still loading onboarding status
        setTimeout(() => {
          setIsAuthenticating(true);
          setAuthMessage('Checking account status...');
        }, 0);
      } else if (!onboardingStatus) {
        setTimeout(() => {
          setIsAuthenticating(true);
          setAuthMessage('Setting up your account...');
        }, 0);
        // This will be handled by the middleware redirect
      } else {
        setTimeout(() => setIsAuthenticating(false), 0);
      }
    } else {
      // User is not authenticated
      setTimeout(() => setIsAuthenticating(false), 0);
    }
  }, [user, isLoaded, onboardingStatus]);

  return {
    isAuthenticating,
    authMessage,
    isLoaded,
    user,
    setAuthenticating: (authenticating: boolean, message?: string) => {
      setIsAuthenticating(authenticating);
      if (message) setAuthMessage(message);
    }
  };
};
