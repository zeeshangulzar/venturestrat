'use client';

import Link from 'next/link';
import { UserButton, SignInButton } from '@clerk/nextjs';

export default function HeaderClient() {
  return (
    <header className="flex justify-between items-center px-5 py-4 gap-4 h-16 border-b border-[#EDEEEF]">
      <Link href="/" className="text-lg font-bold text-gray-800">
        Fundraising
      </Link>

      <div className="flex gap-4 items-center">
        <UserButton />
      </div>
    </header>
  );
}
