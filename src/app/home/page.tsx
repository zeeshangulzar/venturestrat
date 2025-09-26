// src/app/page.tsx
import Logo from '@components/icons/logoIcon';
import SignInLogo from "@components/icons/SignInLogo";
import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VentureStrat - Simplify Your Fundraising',
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.venturestrat.ai/home',
    siteName: 'VentureStrat',
    title: 'VentureStrat - Simplify Your Fundraising',
    description: 'VentureStrat is a fundraising platform for startup founders and entrepreneurs. Browse investor profiles, track your outreach, and draft AI-assisted emails to maximize your fundraising success.',
    images: [
      {
        url: 'https://www.venturestrat.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VentureStrat - Fundraising Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VentureStrat - Simplify Your Fundraising',
    description: 'VentureStrat is a fundraising platform for startup founders and entrepreneurs.',
    images: ['https://www.venturestrat.ai/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.venturestrat.ai/home',
  },
  other: {
    'privacy-policy': 'https://www.venturestrat.ai/privacy-policy',
    'terms-of-service': 'https://www.venturestrat.ai/terms-and-conditions',
  },
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 ">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">VentureStrat</h1>
          <div className="flex items-center justify-center gap-2">
            <Logo className='w-[20px] h-[20px]'/><SignInLogo />
          </div>
          <nav className="space-x-4">
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simplify Your Fundraising</h2>
          <p className="text-lg text-gray-700">
            VentureStrat is a fundraising platform for startup founders and entrepreneurs. Browse investor profiles, track your outreach, and draft AI-assisted emails to maximize your fundraising success.
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">How VentureStrat Works</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Access a curated database of potential investors.</li>
            <li>Shortlist investors and track your interactions.</li>
            <li>Use AI-assisted email drafting to save time and improve communication.</li>
            <li>Manage subscriptions and account settings securely via Stripe.</li>
            <li>Stay informed about new features, modules, and service updates.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">Your Privacy</h3>
          <p className="text-gray-700 mb-2">
            We value your privacy. The data you provide is used solely to improve your experience on the platform. You can view our full privacy practices and rights in our{" "}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>.
          </p>
          <p className="text-gray-700">
            We never sell your personal information and only share data with trusted service providers as needed to operate the platform.
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">Get Started</h3>
          <p className="text-gray-700 mb-4">
            VentureStrat is designed to make fundraising simpler and more effective. Create an account to start exploring investors and manage your fundraising workflow efficiently.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              Log In
            </Link>
          </div>
        </section>

        <section className="text-center mt-16 text-gray-500">
          <p>
            © {new Date().getFullYear()} VentureStrat. All rights reserved.{" "}
            <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            |{" "}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
