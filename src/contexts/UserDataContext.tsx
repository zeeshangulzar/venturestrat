'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserDataContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserDataRefresh = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserDataRefresh must be used within a UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <UserDataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </UserDataContext.Provider>
  );
};
