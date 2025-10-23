'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { GlobalLoadingProvider } from './GlobalLoadingProvider';
import { ModalProvider } from '../contexts/ModalContext';
import { AuthAccountProvider } from '../contexts/AuthAccountContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          loadingIndicator: 'animate-spin h-4 w-4 border-b-2 border-blue-600',
        },
        signIn: {
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            socialButtonsBlockButton: 'bg-[rgba(255,255,255,0.1)] hover:bg-white/20',
          },
        },
        signUp: {
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            socialButtonsBlockButton: 'bg-[rgba(255,255,255,0.1)] hover:bg-white/20',
          },
        },
      }}
    >
      <GlobalLoadingProvider>
        <ModalProvider>
          <AuthAccountProvider>
            {children}
          </AuthAccountProvider>
        </ModalProvider>
      </GlobalLoadingProvider>
    </ClerkProvider>
  );
}
