'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import AuthLoadingOverlay from './AuthLoadingOverlay';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
  loadingMessage: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useGlobalLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};

interface GlobalLoadingProviderProps {
  children: ReactNode;
}

export const GlobalLoadingProvider: React.FC<GlobalLoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const showLoading = useCallback((message: string = 'Loading...') => {
    // Update both states simultaneously to prevent any delay
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  return (
    <LoadingContext.Provider value={{
      showLoading,
      hideLoading,
      isLoading,
      loadingMessage,
    }}>
      {children}
      <AuthLoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
};
