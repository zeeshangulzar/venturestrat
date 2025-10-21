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
          <p className="text-lg text-gray-700 mb-6">
            VentureStrat is a comprehensive fundraising platform designed specifically for startup founders and entrepreneurs seeking investment capital. Our platform streamlines the fundraising process by providing access to a curated database of investors, intelligent outreach tools, and AI-powered email assistance.
          </p>
          <div className="bg-blue-50 p-6 rounded-lg max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-3 text-blue-900">Application Purpose</h3>
            <p className="text-gray-700 mb-4">
              VentureStrat is a comprehensive fundraising management platform designed specifically for startup founders and entrepreneurs seeking investment capital. Our platform serves as a centralized system that helps entrepreneurs identify, connect with, and track communications with potential investors through advanced technology integration.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Core Functionality</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Curated database of potential investors with detailed profiles</li>
                  <li>• AI-powered email drafting and communication tools</li>
                  <li>• Investor shortlisting and interaction tracking</li>
                  <li>• Automated response monitoring and follow-up management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Technology Integration</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Gmail and Microsoft Office 365 integration</li>
                  <li>• Secure email delivery via SendGrid</li>
                  <li>• Payment processing through Stripe</li>
                  <li>• Cloud hosting on AWS and Render</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 mb-2">Data Processing & Privacy</h4>
              <p className="text-sm text-gray-700">
                VentureStrat processes personal and business data solely for fundraising management purposes. We collect profile information, communication data, and usage analytics to provide personalized investor recommendations and optimize your fundraising workflow. All data is encrypted, securely stored, and never sold to third parties. Our platform complies with UAE data protection laws and maintains strict security standards.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">How VentureStrat Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-blue-900">Core Features</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Access a curated database of potential investors with detailed profiles</li>
                <li>Shortlist investors and track your interactions and communication history</li>
                <li>Use AI-assisted email drafting to save time and improve communication</li>
                <li>Manage subscriptions and account settings securely via Stripe</li>
                <li>Stay informed about new features, modules, and service updates</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-blue-900">Email Integration</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Gmail Integration:</strong> Connect your Gmail account to send emails directly through our platform</li>
                <li><strong>Microsoft Office 365:</strong> Seamlessly integrate with Outlook and Office 365 for email management</li>
                <li><strong>Email Tracking:</strong> Automatically track when investors respond to your outreach emails</li>
                <li><strong>Response Management:</strong> Get notified when investors reply and manage follow-ups efficiently</li>
                <li><strong>AI-Powered Assistance:</strong> Generate personalized email content using advanced AI technology</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">Email Integration & Permissions</h3>
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-green-900">Why We Need Email Access</h4>
            <p className="text-gray-700 mb-4">
              VentureStrat requires access to your Gmail or Microsoft Office 365 account to provide the following essential fundraising features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Send Emails:</strong> We use the "send" scope to send personalized outreach emails to investors on your behalf</li>
              <li><strong>Read Emails:</strong> We use the "readonly" scope to monitor incoming responses from investors and automatically update your fundraising pipeline</li>
              <li><strong>Email Management:</strong> Track which investors have responded, manage follow-ups, and maintain a complete communication history</li>
              <li><strong>AI Integration:</strong> Process email content to provide intelligent suggestions and automated responses</li>
            </ul>
            <p className="text-gray-700">
              <strong>Data Security:</strong> All email data is processed securely and is never shared with third parties. We only access the emails necessary for fundraising management.
            </p>
          </div>
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
          <h3 className="text-2xl font-semibold mb-4">Company Information & Legal Compliance</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Company Details</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Company Name:</strong> VentureStrat</li>
                  <li><strong>Registration:</strong> United Arab Emirates</li>
                  <li><strong>Contact Email:</strong> ibrahim@venturestrat.co</li>
                  <li><strong>Address:</strong> Al Thanyah Road, UAE</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Legal Framework</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Governed by UAE laws and regulations</li>
                  <li>• Compliant with UAE Personal Data Protection Law</li>
                  <li>• PCI-DSS compliant payment processing</li>
                  <li>• Secure cloud infrastructure (AWS/Render)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>Service Scope:</strong> VentureStrat provides fundraising management tools and investor database access. We are not an investment advisor, broker-dealer, or intermediary. We do not provide financial advice or guarantee fundraising success. Users are responsible for their own due diligence and professional decisions.
              </p>
            </div>
          </div>
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
