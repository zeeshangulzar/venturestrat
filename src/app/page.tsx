// src/app/home/page.tsx
import { SignedIn, SignedOut, SignInButton, UserButton, SignUpButton } from '@clerk/nextjs';
import InvestorsPage from '@app/investors/page';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <div className="flex-1 bg-white">
        <SignedIn>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Investor Directory!
          </h1>
          <p className="text-gray-600 mb-6">
            Explore our list of amazing investors.
          </p>
          <InvestorsPage />
        </SignedIn>

        <SignedOut>
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Please Sign In to Explore Investors!
            </h1>
            <p className="text-gray-600 mb-6">
              To explore our list of investors, please sign in or create an account.
            </p>
            <div className="flex justify-center gap-4">
              <SignInButton>
                <button className="bg-blue-600 text-white rounded-full px-6 py-3">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-green-600 text-white rounded-full px-6 py-3">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
