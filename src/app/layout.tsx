import './globals.css';
import Providers from '@components/providers';
import ConditionalHeader from '@components/ConditionalHeader';
import ConditionalSidebar from '@components/ConditionalSidebar';
import AuthFlowManager from '@components/AuthFlowManager';

export const metadata = {
  title: 'VentureStrat - Fundraising Platform for Startups',
  description: 'VentureStrat is a fundraising platform for startup founders and entrepreneurs. Browse investor profiles, track your outreach, and draft AI-assisted emails to maximize your fundraising success.',
  keywords: 'fundraising, investors, startup, venture capital, AI email, investor database, startup funding',
  authors: [{ name: 'VentureStrat' }],
  creator: 'VentureStrat',
  publisher: 'VentureStrat',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.venturestrat.ai',
    siteName: 'VentureStrat',
    title: 'VentureStrat - Fundraising Platform for Startups',
    description: 'VentureStrat is a fundraising platform for startup founders and entrepreneurs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VentureStrat - Fundraising Platform for Startups',
    description: 'VentureStrat is a fundraising platform for startup founders and entrepreneurs.',
  },
  alternates: {
    canonical: 'https://www.venturestrat.ai',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <AuthFlowManager>
            <div className="flex min-h-screen bg-gray-50">
              {/* Conditional Sidebar - only shows for non-admin, non-onboarding routes */}
              <ConditionalSidebar />
              
              {/* Main content area */}
              <div className="flex-1 bg-white">
                {/* Header only for authenticated users on non-onboarding routes */}
                <ConditionalHeader />
                {children}
              </div>
            </div>
          </AuthFlowManager>
        </Providers>
      </body>
    </html>
  );
}
