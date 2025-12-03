'use client';

import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import InvestorsPage from '@app/investors/page';
import HomePage from "@components/HomePage";

export default function Home() {
  const router = useRouter();
  const { isLoaded } = useUser();

  // Show loading state while Clerk determines authentication status
  if (!isLoaded) {
    return null; // Let the GlobalLoadingProvider handle loading display
  }

  return (
    <>
      <SignedIn>
        <InvestorsPage />
      </SignedIn>

      <SignedOut>
        <HomePage />
      </SignedOut>
    </>
  );
}
