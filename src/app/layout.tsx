import './globals.css';
import Providers from '@components/providers';
import HeaderClient from '@components/HeaderClient';
import ConditionalSidebar from '@components/ConditionalSidebar';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const metadata = {
  title: 'Investor Directory',
  description: 'Explore investors and their details',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen bg-gray-50">
            {/* Conditional Sidebar - only shows for non-admin routes */}
            <ConditionalSidebar />

            {/* Main content area */}
            <div className="flex-1 bg-white">
              {/* Header only for authenticated users */}
              <SignedIn>
                <HeaderClient />
              </SignedIn>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
