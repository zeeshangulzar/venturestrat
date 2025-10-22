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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <header className="bg-[#0c2143] shadow-xl border-b border-[#0c2143]/20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className='w-[32px] h-[32px] text-white'/>
            <h1 className="text-3xl font-bold text-white">VentureStrat</h1>
          </div>
          <div className="flex items-center gap-4">
            <SignInLogo />
            <nav className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* App Purpose - Most Prominent */}
        <section className="bg-[#0c2143] text-white p-12 rounded-2xl mb-12 text-center shadow-2xl">
          <h1 className="text-5xl font-bold mb-6">VentureStrat</h1>
          <h2 className="text-3xl font-bold mb-6">Fundraising Management Platform</h2>
          <p className="text-xl mb-6 max-w-4xl mx-auto">
            <strong>Purpose:</strong> VentureStrat is a fundraising management platform that helps startup founders identify, connect with, and track communications with potential investors through email integration and AI-powered assistance.
          </p>
          <p className="text-lg max-w-4xl mx-auto">
            <strong>Data Usage:</strong> We access your Gmail or Microsoft Office 365 account to send outreach emails to investors and track their responses to help manage your fundraising pipeline.
          </p>
        </section>

        {/* What VentureStrat Does */}
        <section className="mb-16">
          <div className="bg-[#0c2143] text-white p-10 rounded-2xl shadow-2xl">
            <h3 className="text-3xl font-bold mb-6 text-center">What VentureStrat Does</h3>
            <p className="text-xl mb-8 text-center max-w-4xl mx-auto">
              VentureStrat is a <strong>fundraising management platform</strong> that helps startup founders:
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Find and research investors</h4>
                    <p className="text-white/90">Access our curated database of potential investors with detailed profiles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Send personalized outreach emails</h4>
                    <p className="text-white/90">Use AI-powered assistance to craft compelling investor communications</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Track investor responses</h4>
                    <p className="text-white/90">Automatically monitor incoming responses through email integration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Manage fundraising pipeline</h4>
                    <p className="text-white/90">Maintain comprehensive communication history and follow-up tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
          
        {/* App Purpose & Functionality */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-sm border border-[#0c2143]/20 p-10 rounded-2xl shadow-xl">
            <h3 className="text-3xl font-bold mb-8 text-center text-[#0c2143]">App Purpose & Functionality</h3>
            <div className="text-center mb-10">
              <p className="text-xl text-gray-800 mb-6 max-w-4xl mx-auto">
                <strong>VentureStrat is a fundraising management platform</strong> designed specifically for startup founders and entrepreneurs seeking investment capital.
              </p>
              <p className="text-lg text-gray-700 max-w-4xl mx-auto">
                Our platform serves as a centralized system that helps entrepreneurs identify, connect with, and track communications with potential investors through advanced technology integration including Gmail and Microsoft Office 365.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#0c2143]/5 border border-[#0c2143]/20 p-6 rounded-xl text-center hover:bg-[#0c2143]/10 transition-all hover:shadow-lg">
                <h4 className="font-bold text-[#0c2143] mb-3 text-lg">Database Access</h4>
                <p className="text-gray-700">Access curated investor profiles and detailed information</p>
              </div>
              <div className="bg-[#0c2143]/5 border border-[#0c2143]/20 p-6 rounded-xl text-center hover:bg-[#0c2143]/10 transition-all hover:shadow-lg">
                <h4 className="font-bold text-[#0c2143] mb-3 text-lg">Email Integration</h4>
                <p className="text-gray-700">Send and track emails through Gmail/Office 365</p>
              </div>
              <div className="bg-[#0c2143]/5 border border-[#0c2143]/20 p-6 rounded-xl text-center hover:bg-[#0c2143]/10 transition-all hover:shadow-lg">
                <h4 className="font-bold text-[#0c2143] mb-3 text-lg">AI Assistance</h4>
                <p className="text-gray-700">AI-powered email drafting and communication tools</p>
              </div>
            </div>
          </div>
        </section>

        {/* How VentureStrat Works */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center text-[#0c2143]">How VentureStrat Works</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-50/90 to-blue-50/90 backdrop-blur-sm p-8 rounded-2xl border border-[#0c2143]/20 shadow-xl hover:shadow-2xl transition-all">
              <h4 className="text-xl font-bold mb-6 text-[#0c2143]">Core Features</h4>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <span>Access a curated database of potential investors with detailed profiles</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <span>Shortlist investors and track your interactions and communication history</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <span>Use AI-assisted email drafting to save time and improve communication</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <span>Manage subscriptions and account settings securely via Stripe</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <span>Stay informed about new features, modules, and service updates</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-slate-50/90 to-blue-50/90 backdrop-blur-sm p-8 rounded-2xl border border-[#0c2143]/20 shadow-xl hover:shadow-2xl transition-all">
              <h4 className="text-xl font-bold mb-6 text-[#0c2143]">Email Integration</h4>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <strong>Gmail Integration:</strong> Connect your Gmail account to send emails directly through our platform
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <strong>Microsoft Office 365:</strong> Seamlessly integrate with Outlook and Office 365 for email management
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <strong>Email Tracking:</strong> Automatically track when investors respond to your outreach emails
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <strong>Response Management:</strong> Get notified when investors reply and manage follow-ups efficiently
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0c2143] rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <strong>AI-Powered Assistance:</strong> Generate personalized email content using advanced AI technology
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Email Permissions - Prominent Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-[#0c2143] to-[#0c2143]/90 border-2 border-[#0c2143] p-8 rounded-xl shadow-xl">
            <h3 className="text-3xl font-bold mb-6 text-white text-center">Email Access Required</h3>
            <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-sm p-6 rounded-xl mb-6 shadow-lg">
              <h4 className="text-xl font-bold mb-4 text-[#0c2143]">Why VentureStrat Needs Email Access</h4>
              <p className="text-lg text-gray-700 mb-6">
                <strong>VentureStrat is a fundraising management platform that requires email integration to function.</strong> We need access to your Gmail or Microsoft Office 365 account to provide our core fundraising services:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#0c2143]/10 border border-[#0c2143]/20 p-4 rounded-lg">
                  <h5 className="font-bold text-[#0c2143] mb-2">SEND EMAILS TO INVESTORS</h5>
                  <p className="text-sm text-gray-700">
                    We use the <strong>&quot;send&quot;</strong> scope to send personalized outreach emails to potential investors on your behalf, helping you reach more investors efficiently.
                  </p>
                </div>
                <div className="bg-[#0c2143]/10 border border-[#0c2143]/20 p-4 rounded-lg">
                  <h5 className="font-bold text-[#0c2143] mb-2">TRACK INVESTOR RESPONSES</h5>
                  <p className="text-sm text-gray-700">
                    We use the <strong>&quot;readonly&quot;</strong> scope to monitor incoming responses from investors and automatically update your fundraising pipeline with their replies.
                  </p>
                </div>
              </div>
              
              <div className="bg-[#0c2143]/5 border border-[#0c2143]/30 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-[#0c2143] mb-2">DATA USAGE TRANSPARENCY</h5>
                <p className="text-sm text-gray-700">
                  <strong>We only access emails related to your fundraising activities.</strong> All email data is processed securely, encrypted, and never shared with third parties. We comply with UAE data protection laws and maintain strict security standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 text-[#0c2143]">Your Privacy</h3>
          <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm p-6 rounded-xl border border-[#0c2143]/20 shadow-lg">
            <p className="text-gray-700 mb-2">
              We value your privacy. The data you provide is used solely to improve your experience on the platform. You can view our full privacy practices and rights in our{" "}
              <Link href="/privacy-policy" className="text-[#0c2143] hover:underline font-semibold">
                Privacy Policy
              </Link>.
            </p>
            <p className="text-gray-700">
              We never sell your personal information and only share data with trusted service providers as needed to operate the platform.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 text-[#0c2143]">Company Information & Legal Compliance</h3>
          <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm p-6 rounded-xl border border-[#0c2143]/20 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#0c2143] mb-3">Company Details</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Company Name:</strong> VentureStrat</li>
                  <li><strong>Registration:</strong> United Arab Emirates</li>
                  <li><strong>Contact Email:</strong> ibrahim@venturestrat.co</li>
                  <li><strong>Address:</strong> Al Thanyah Road, UAE</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#0c2143] mb-3">Legal Framework</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Governed by UAE laws and regulations</li>
                  <li>• Compliant with UAE Personal Data Protection Law</li>
                  <li>• PCI-DSS compliant payment processing</li>
                  <li>• Secure cloud infrastructure (AWS/Render)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-[#0c2143]/5 border border-[#0c2143]/20 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Service Scope:</strong> VentureStrat provides fundraising management tools and investor database access. We are not an investment advisor, broker-dealer, or intermediary. We do not provide financial advice or guarantee fundraising success. Users are responsible for their own due diligence and professional decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 text-[#0c2143]">Get Started</h3>
          <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm p-8 rounded-xl border border-[#0c2143]/20 shadow-lg text-center">
            <p className="text-gray-700 mb-6 text-lg">
              VentureStrat is designed to make fundraising simpler and more effective. Create an account to start exploring investors and manage your fundraising workflow efficiently.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-[#0c2143] text-white font-semibold rounded-xl hover:bg-[#0c2143]/90 transition-all shadow-lg hover:shadow-xl"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 border-2 border-[#0c2143] text-[#0c2143] font-semibold rounded-xl hover:bg-[#0c2143]/5 transition-all"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        <section className="text-center mt-16 text-gray-500 bg-gradient-to-br from-slate-50/60 to-blue-50/60 backdrop-blur-sm p-6 rounded-xl border border-[#0c2143]/10">
          <p>
            © {new Date().getFullYear()} VentureStrat. All rights reserved.{" "}
            <Link href="/terms-and-conditions" className="text-[#0c2143] hover:underline font-semibold">
              Terms of Service
            </Link>{" "}
            |{" "}
            <Link href="/privacy-policy" className="text-[#0c2143] hover:underline font-semibold">
              Privacy Policy
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
