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

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
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
    
    // Check if Clerk is loaded and signUp is available
    if (!isLoaded || !signUp) {
      console.error('Clerk not loaded or signUp not available:', { isLoaded, signUp });
      setError('Authentication service not ready. Please try again.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      console.log('Attempting to create account with:', { firstName, lastName, email });
      console.log('Clerk signUp object:', signUp);
      
      const res = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      console.log('Sign up response:', res);

      try {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setNeedsVerification(true);          // show the code UI
      } catch (verificationError) {
        console.log('Verification not required or failed:', verificationError);
        // If verification is not required, continue
      }

      // If verification is NOT required, status might already be "complete"
      if (res.status === 'complete' && res.createdSessionId) {
        await setActive!({ session: res.createdSessionId });
        // The middleware will handle redirecting to onboarding if needed
        router.replace('/');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err || {}));
      console.error('Error stringified:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Sign up failed';
      
      if (err?.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || 'Sign up failed';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status) {
        errorMessage = `Sign up failed with status: ${err.status}`;
      } else if (err?.code) {
        errorMessage = `Sign up failed with code: ${err.code}`;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        // Try to extract any meaningful error information
        const errorText = Object.values(err).find(val => 
          typeof val === 'string' && val.length > 0
        );
        if (errorText) {
          errorMessage = String(errorText);
        }
      }
      
      setError(errorMessage);
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
      console.log('Attempting to verify code:', code);
      
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      console.log('Verification response:', attempt);

      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive!({ session: attempt.createdSessionId });
        // The middleware will handle redirecting to onboarding if needed
        router.replace('/');
      } else {
        // If not complete yet, you might need to handle other statuses here
        setError(`Verification incomplete. Status: ${attempt.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      
      let errorMessage = 'Invalid code';
      
      if (err?.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || 'Invalid code';
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status) {
        errorMessage = `Verification failed with status: ${err.status}`;
      }
      
      setError(errorMessage);
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
        <div className="w-full max-w-md space-y-8 p-8 shadow-2xl bg-[#1b2130] rounded-[14px] border border-[rgba(37,99,235,0.1)]">
          <div className="text-center">
            <div className="flex items-center justify-center mb-5">
              <LogoIcon />
            </div>
            <h1 className="text-2xl font-bold text-[#ffffff]">Create your account</h1>
            <p className="mt-2 text-sm text-white opacity-60">We'll use this information to complete your profile.</p>
          </div>

        {error && (
          <div className="rounded-[14px] bg-red-900/20 border border-red-500/30 p-4">
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
          <form onSubmit={onSubmit} className="space-y-6 mb-[unset]">
            {/* First Name and Last Name in same row */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className="h-[42] font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] w-full rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  className="h-[42] font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  placeholder="Last Name"
                />
              </div>

              <div>
                <input
                  type="email"
                  className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Password"
                />
              </div>

              <div>
                <input
                  type="password"
                  className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div className='mt-[72px] mb-5'>
              <button 
                type="submit" 
                disabled={loading} 
                className="not-italic font-bold text-sm leading-[19px] tracking-[-0.02em] text-[#FFFFFF] w-full bg-[#2563EB] rounded-[10px] px-5 py-[13px] gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    Create account
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_1121_3914)">
                      <path d="M16.332 10H4.66536" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.332 10L12.9987 13.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.332 10.0001L12.9987 6.66675" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_1121_3914">
                      <rect width="20" height="20" fill="white" transform="matrix(-1 0 0 1 20.5 0)"/>
                      </clipPath>
                      </defs>
                    </svg>
                  </span>
                )}
              </button>
            
            </div>
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
                className="text-[#5e6269] w-full rounded-[14px] border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-lg tracking-widest"
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
              className="w-full bg-blue-600 text-white rounded-[14px] px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying…' : 'Verify & continue'}
            </button>
          </form>
        )}

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-[#FFFFFF]">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button 
          onClick={onGoogle} 
          className="h-[46px] w-full bg-[rgba(255, 255, 255, 0.1)] text-[#FFFFFF] border not-italic font-small text-sm leading-[19px] tracking-[-0.02em] rounded-[10px] px-4 py-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="inline-flex items-center gap-1">
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.325 8.23735H18.6V8.2H10.5V11.8H15.5864C14.8443 13.8956 12.8504 15.4 10.5 15.4C7.51785 15.4 5.1 12.9822 5.1 10C5.1 7.01785 7.51785 4.6 10.5 4.6C11.8765 4.6 13.1289 5.1193 14.0824 5.96755L16.6281 3.4219C15.0207 1.92385 12.8706 1 10.5 1C5.52975 1 1.5 5.02975 1.5 10C1.5 14.9703 5.52975 19 10.5 19C15.4703 19 19.5 14.9703 19.5 10C19.5 9.39655 19.4379 8.8075 19.325 8.23735Z" fill="#FFC107"/>
              <path d="M2.53781 5.81095L5.49476 7.9795C6.29486 5.9986 8.23245 4.6 10.5 4.6C11.8765 4.6 13.1289 5.1193 14.0824 5.96755L16.6281 3.4219C15.0207 1.92385 12.8706 1 10.5 1C7.0431 1 4.04531 2.95165 2.53781 5.81095Z" fill="#FF3D00"/>
              <path d="M10.5 19C12.8247 19 14.9367 18.1105 16.5337 16.6638L13.7482 14.3067C12.8142 15.017 11.6734 15.4009 10.5 15.4C8.1591 15.4 6.1711 13.9075 5.4223 11.8245L2.4874 14.0857C3.9769 17.0004 7.00215 19 10.5 19Z" fill="#4CAF50"/>
              <path d="M19.325 8.23735H18.6V8.2H10.5V11.8H15.5864C15.2314 12.7974 14.5917 13.6691 13.7469 14.3071L13.7482 14.3067L16.5337 16.6638C16.3366 16.8429 19.5 14.5 19.5 10C19.5 9.39655 19.4379 8.8075 19.325 8.23735Z" fill="#1976D2"/>
            </svg>
            Continue with<span className='font-medium'>Google</span>
          </span>
        </button>

        <div className="text-center">
          <p className="text-sm text-[#FFFFFF]">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-[#FFFFFF]">
            By creating an account, you agreeing to the
          </p>
          <p className="text-sm text-[#FFFFFF]">
            <span className='font-semibold'>Terms of Service</span> and <span className='font-semibold'>Privacy Policy.</span>
          </p>
        </div>
        </div>
      </div>
    </main>
  );
}
