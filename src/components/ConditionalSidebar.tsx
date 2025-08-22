'use client';

import { usePathname } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';
import Sidebar from './Sidebar';

export default function ConditionalSidebar() {
  const pathname = usePathname();
  
  // Don't render sidebar for admin routes (they have their own sidebar)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <SignedIn>
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </SignedIn>
  );
}
