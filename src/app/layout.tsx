import './globals.css';
import Providers from '@components/providers';
import ConditionalHeader from '@components/ConditionalHeader';
import ConditionalSidebar from '@components/ConditionalSidebar';
import ConditionalAdminSidebar from '@components/ConditionalAdminSidebar';
import AuthFlowManager from '@components/AuthFlowManager';
import { UserDataProvider } from '../contexts/UserDataContext';

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
      <head>
        {/* Google Fonts for Quill Editor */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Raleway:wght@300;400;500;600;700&family=PT+Sans:wght@400;700&family=Oswald:wght@300;400;500;600;700&family=Lora:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Indie+Flower&family=Pacifico&family=Lobster&family=Shadows+Into+Light&family=Kaushan+Script&family=Righteous&family=Bangers&family=Fredoka+One&family=Comfortaa:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Ubuntu:wght@300;400;500;700&family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Serif:wght@400;500;600;700&family=Crimson+Text:wght@400;600;700&family=Libre+Baskerville:wght@400;700&family=Work+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <UserDataProvider>
            <AuthFlowManager>
              <div className="flex min-h-screen bg-gray-50">
                {/* Conditional Sidebar - only shows for non-admin, non-onboarding routes */}
                <ConditionalAdminSidebar />
                <ConditionalSidebar />
                
                {/* Main content area */}
                <div className="flex-1 bg-white">
                  {/* Header only for authenticated users on non-onboarding routes */}
                  <ConditionalHeader />
                  {children}
                </div>
              </div>
            </AuthFlowManager>
          </UserDataProvider>
        </Providers>
      </body>
    </html>
  );
}
