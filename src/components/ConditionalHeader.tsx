'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import HeaderClient from './HeaderClient';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // Immediately update render state when authentication changes
    setTimeout(() => setShouldRender(isLoaded && isSignedIn), 0);
  }, [isLoaded, isSignedIn]);

  // Don't render header for onboarding (focused process)
  if (pathname?.startsWith('/onboarding')) {
    return null;
  }

  // Don't render anything while loading or when not signed in
  if (!isLoaded || !shouldRender) {
    return null;
  }

  return <HeaderClient />;
}
