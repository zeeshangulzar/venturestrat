'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Sidebar from '@components/Sidebar';

export default function HeaderClient() {
  return (
    <header className="flex justify-between items-center px-5 py-4 gap-4 h-16 border-b border-[#EDEEEF]">
      <Link href="/" className="text-lg font-bold text-gray-800">
        Fundraising
      </Link>

      <div className="flex gap-4 items-center">
        <SignedIn>
          <div className="flex gap-4 items-center">
            <UserButton />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}

// Export a separate, named client component instead of attaching as a property
export function SidebarWrapper() {
  return (
    <SignedIn>
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </SignedIn>
  );
}
