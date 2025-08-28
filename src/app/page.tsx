'use client';

import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import InvestorsPage from '@app/investors/page';
import PageLoader from '@components/PageLoader';

export default function Home() {
  const router = useRouter();
  const { isLoaded } = useUser();

  // Show loading state while Clerk determines authentication status
  if (!isLoaded) {
    return <PageLoader message="Checking authentication..." />;
  }

  return (
    <>
      <SignedIn>
        <InvestorsPage />
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Investor Directory
            </h1>
            <p className="text-gray-600 mb-6">
              Create an account to explore our list of investors and their details.
            </p>
            <button 
              onClick={() => router.push('/sign-up')}
              className="bg-blue-600 text-white rounded-md px-6 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
