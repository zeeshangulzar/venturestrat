// src/app/layout.tsx
import Link from 'next/link';
import Sidebar from '@components/Sidebar';  // Import Sidebar
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar /> {/* Add sidebar to layout */}

          {/* Main Content Area */}
          <div className="flex-1 p-8 bg-white">
            <header className="flex justify-between items-center p-4 gap-4 h-16 border-b bg-white">
              <div>
                <Link href="/" className="text-lg font-bold text-gray-800">
                  Investor Directory
                </Link>
              </div>
              <div className="flex gap-4 items-center">
                {/* Add Clerk logic back here later */}
              </div>
            </header>

            {/* Main Content */}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
