// src/app/layout.tsx
import Link from 'next/link';
import Sidebar from '@components/Sidebar';
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Investor Directory',
  description: 'Explore investors and their details',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <SignedIn>
              <Sidebar /> {/* Sidebar is part of the layout */}
            </SignedIn>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-white">
              <header className="flex justify-between items-center p-4 gap-4 h-16 border-b bg-white">
                <div>
                  <Link href="/" className="text-lg font-bold text-gray-800">
                    Investor Directory
                  </Link>
                </div>
                <div className="flex gap-4 items-center">
                  {/* Clerk SignedIn - Show user info when logged in */}
                  <SignedIn>
                    <div className="flex gap-4 items-center">
                      <span className="text-gray-800">Welcome, </span>
                      <UserButton /> {/* User's profile or sign out button */}
                    </div>
                  </SignedIn>

                  {/* Clerk SignedOut - Show Sign In Button when not logged in */}
                  <SignedOut>
                    <SignInButton>
                      <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </header>

              {/* Main Content */}
              {children}
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
