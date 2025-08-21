import './globals.css';
import Providers from '@components/providers';
import HeaderClient, { SidebarWrapper } from '@components/HeaderClient';
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
            {/* Sidebar and Header only for authenticated users */}
            <SignedIn>
              <SidebarWrapper />
              <div className="flex-1 bg-white">
                <HeaderClient />
                {children}
              </div>
            </SignedIn>
            
            {/* For unauthenticated users, just render children */}
            <SignedOut>
              {children}
            </SignedOut>
          </div>
        </Providers>
      </body>
    </html>
  );
}
