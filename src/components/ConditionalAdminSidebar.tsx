'use client';

import { usePathname } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';
import AdminSidebar from './AdminSidebar';

export default function ConditionalAdminSidebar() {
  const pathname = usePathname();

  if (!pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <SignedIn>
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
    </SignedIn>
  );
}
