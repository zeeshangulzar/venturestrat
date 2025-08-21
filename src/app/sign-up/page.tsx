// app/(public)/sign-up/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Loader from '@components/Loader';
import LogoIcon from '@components/icons/LogoWithText';

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, isLoaded: userLoaded } = useUser();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [companyUrl, setCompanyUrl] = React.useState('');

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Email-code verification step (only used if your Clerk instance requires it)
  const [needsVerification, setNeedsVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  // Check if user is already signed in and redirect appropriately
  React.useEffect(() => {
    if (user) {
      const onboardingComplete = (user.publicMetadata as any)?.onboardingComplete === true
      if (onboardingComplete) {
        router.replace('/')
      } else {
        router.replace('/onboarding')
      }
    }
  }, [user, router])

  // Show loading state while Clerk determines authentication status
  if (!isLoaded || !userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading sign-up page..." />
      </div>
    );
  }

  // Don't render if user is already signed in
  if (user) {
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError(null);
    setLoading(true);
    
    try {
      const res = await signUp.create({
        emailAddress: email,
        password,
      });

      try {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setNeedsVerification(true);          // show the code UI
      } catch {
        // If verification is not required, continue
      }

      // If verification is NOT required, status might already be "complete"
      if (res.status === 'complete' && res.createdSessionId) {
        await setActive!({ session: res.createdSessionId });
        // The middleware will handle redirecting to onboarding if needed
        router.replace('/');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError(null);
    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive!({ session: attempt.createdSessionId });
        // The middleware will handle redirecting to onboarding if needed
        router.replace('/');
      } else {
        // If not complete yet, you might need to handle other statuses here
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    if (!isLoaded || !signUp) return;
    await signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/', // middleware handles onboarding redirect
    });
  };

  return (
    <main className="min-h-screen bg-[#0c2143] relative w-full">
      {/* Top left logo */}
      <div className="absolute top-6 left-6">
        <LogoIcon />
      </div>
      
      {/* Center content */}
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 p-8 shadow-md bg-[#1b2130] rounded-[14px]">
          <div className="text-center">
            <div className="flex items-center justify-center mb-5">
              <LogoIcon />
            </div>
            <h1 className="text-2xl font-bold text-[#ffffff]">Create your account</h1>
            <p className="mt-2 text-sm text-[#a5a6ac]">We'll use this information to complete your profile.</p>
          </div>

        {error && (
          <div className="rounded-md bg-red-900/20 border border-red-500/30 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!needsVerification ? (
          <>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                className="text-[#84858c] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="jeff@amazon.com"
              />
            </div>

            <div>
              <input
                type="password"
                className="text-[#84858c] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Password"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
                          </button>
            </form>
            </>
        ) : (
          <form onSubmit={onVerify} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[#a5a6ac] mb-4">We sent a verification code to your email. Enter it below:</p>
              <p className="text-xs text-[#84858c] mb-4">Check your spam folder if you don't see it in your inbox.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Verification code</label>
              <input
                type="text"
                className="text-[#5e6269] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-lg tracking-widest"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="000000"
                required
                maxLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying…' : 'Verify & continue'}
            </button>
          </form>
        )}

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button 
          onClick={onGoogle} 
          className="w-full bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue with Google
        </button>

        <div className="text-center">
          <p className="text-sm text-[#a5a6ac]">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-[#a5a6ac]">
            By creating an account, you agreeing to the
          </p>
          <p className="text-sm text-[#a5a6ac]">
            <span className='font-semibold'>Terms of Service</span> and <span className='font-semibold'>Privacy Policy.</span>
          </p>
        </div>
        </div>
      </div>
    </main>
  );
}
