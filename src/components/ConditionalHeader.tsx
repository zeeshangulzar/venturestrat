'use client';

import { usePathname } from 'next/navigation';
import HeaderClient from './HeaderClient';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't render header for onboarding (focused process)
  if (pathname?.startsWith('/onboarding')) {
    return null;
  }

  return <HeaderClient />;
}
