import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-white shadow-xl rounded-xl text-center">
        <SignedIn>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Investor Directory!
          </h1>
          <p className="text-gray-600 mb-6">
            You are signed in. Explore our list of amazing investors.
          </p>
          <Link
            href="/brokers"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            View Brokers
          </Link>
        </SignedIn>

        <SignedOut>
           {/*Adding for now, remove when needed*/}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Investor Directory!
          </h1>
          <p className="text-gray-600 mb-6">
            Explore our list of amazing investors.
          </p>
          <Link
            href="/brokers"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            View Brokers
          </Link>
          {/*commented out for now, uncomment when needed*/}
          {/* <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access the broker directory.
          </p>
          <SignInButton>
            <button className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton> */}
        </SignedOut>
      </div>
    </div>
  );
}

