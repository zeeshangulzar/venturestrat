import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export const useAuthState = () => {
  const { user, isLoaded } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    // Show loading when user state is changing
    if (!isLoaded) {
      setIsAuthenticating(true);
      setAuthMessage('Loading authentication...');
    } else if (user) {
      // User is authenticated, check onboarding status
      const onboardingComplete = (user.publicMetadata as { onboardingComplete?: boolean })?.onboardingComplete === true;
      
      if (!onboardingComplete) {
        setIsAuthenticating(true);
        setAuthMessage('Setting up your account...');
        // This will be handled by the middleware redirect
      } else {
        setIsAuthenticating(false);
      }
    } else {
      // User is not authenticated
      setIsAuthenticating(false);
    }
  }, [user, isLoaded]);

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
