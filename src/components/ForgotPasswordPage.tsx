'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn, useUser } from '@clerk/nextjs';
import PageLoader from '@components/PageLoader';
import LogoIcon from '@components/icons/LogoWithText';
import Logo from '@components/icons/logoIcon';
import SignInLogo from '@components/icons/SignInLogo';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
export const dynamic = "force-dynamic";
export const revalidate = 0;

const passwordRules = [
  {
    key: 'length',
    label: 'At least 8 characters',
    errorMessage: 'Password must be at least 8 characters long.',
    test: (value: string) => value.length >= 8,
  },
  {
    key: 'uppercase',
    label: 'At least 1 uppercase letter',
    errorMessage: 'Password must include at least 1 uppercase letter.',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    key: 'number',
    label: 'At least 1 number',
    errorMessage: 'Password must include at least 1 number.',
    test: (value: string) => /\d/.test(value),
  },
  {
    key: 'special',
    label: 'At least 1 special character (!@#$%^&*()-__+.)',
    errorMessage: 'Password must include at least 1 special character (!@#$%^&*()-__+.).',
    test: (value: string) => /[!@#$%^&*()\-__+.]/.test(value),
  },
];

type Step = 'request' | 'reset';

export default function ForgotPassword() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user, isLoaded: userLoaded } = useUser();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = (value: string) => /.+@.+\..+/.test(value.trim());

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  if (!isLoaded || !userLoaded) {
    if (!userLoaded && !user) {
      return <PageLoader message="Loading password reset..." />;
    }
    if (!isLoaded) {
      return <PageLoader message="Initializing..." />;
    }
  }

  if (user) {
    return null;
  }

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;

    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('reset');
    } catch (err: any) {
      const clerkError = err?.errors?.[0]?.message as string | undefined;
      const normalizedMessage = clerkError?.toLowerCase() ?? '';

      if (normalizedMessage.includes('identifier is invalid')) {
        setError('Please enter a valid email address.');
      } else {
        setError(clerkError || 'Unable to send reset instructions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (value: string): string | null => {
    if (!value) {
      return 'Password must be at least 8 characters long.';
    }

    const failingRule = passwordRules.find((rule) => !rule.test(value));
    return failingRule ? failingRule.errorMessage : null;
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;

    setError(null);

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    setLoading(true);

    try {
      const verification = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      });

      if (verification.status !== 'needs_new_password') {
        throw new Error('Invalid or expired code. Please request a new one.');
      }

      const resetResult = await signIn.resetPassword({
        password,
      });

      if (resetResult.status === 'complete') {
        await setActive?.({ session: resetResult.createdSessionId });
        router.replace('/');
        return;
      }

      if (resetResult.status === 'needs_first_factor') {
        setError('The reset code verification expired. Please request a new code.');
        return;
      }

      setError('Additional verification required.');
    } catch (err: any) {
      const clerkError = err?.errors?.[0]?.message as string | undefined;
      const normalizedMessage = clerkError?.toLowerCase() ?? '';

      if (normalizedMessage.includes('send a verification code before')) {
        setError('Your reset code expired. Please request a new code and try again.');
      } else if (err?.message?.toLowerCase().includes('send a verification code before')) {
        setError('Your reset code expired. Please request a new code and try again.');
      } else {
        setError(err?.message || clerkError || 'Unable to reset password. Please check the code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded || !signIn) return;

    setError(null);
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setError('A new code has been sent to your email.');
    } catch (err: any) {
      const clerkError = err?.errors?.[0]?.message as string | undefined;
      setError(clerkError || 'Unable to resend the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasPasswordMismatch =
    step === 'reset' && Boolean(password) && Boolean(confirmPassword) && password !== confirmPassword;
  const passwordChecks = passwordRules.map((rule) => ({ key: rule.key, label: rule.label, valid: rule.test(password) }));
  const passwordRequirementError = step === 'reset' && password ? validatePassword(password) : null;
  const disableReset =
    loading ||
    hasPasswordMismatch ||
    passwordChecks.some((rule) => !rule.valid) ||
    (step === 'reset' && code.trim().length < 6);

  return (
    <main className="min-h-screen bg-[#0c2143] relative w-full">
      <div className="absolute top-6 left-6">
        <LogoIcon />
      </div>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 p-8 shadow-[0_0_15px_5px_rgba(37,99,235,0.1)] bg-[#1b2130] rounded-[14px] border border-[rgba(37,99,235,0.1)]">
          <div className="text-center">
            <div className="flex items-center justify-center mb-5 gap-2">
              <Logo className="w-[20px] h-[20px]" />
              <SignInLogo />
            </div>
            <h1 className="text-2xl font-bold text-[#ffffff]">Reset your password</h1>
            <p className="mt-2 text-sm text-[#a5a6ac]">
              {step === 'request'
                ? 'Enter your account email and we will send you a reset code.'
                : 'Enter the code from your email along with a new password.'}
            </p>
          </div>

          {error && (
            <div className="rounded-[14px] bg-red-900/20 border border-red-500/30 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-6">
              <div>
                <input
                  type="email"
                  className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="jeff@amazon.com"
                />
              </div>

              <div className="mt-12 mb-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer not-italic font-bold text-sm leading-[19px] tracking-[-0.02em] text-[#FFFFFF] w-full bg-[#2563EB] rounded-[10px] px-5 py-[13px] gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending reset code...' : 'Send reset code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <input
                  type="text"
                  className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                  placeholder="Enter the 6-digit code"
                />
              </div>

              <div className="space-y-4">
                <label className="flex flex-col gap-2 text-xs font-medium text-[#a5a6ac]">
                  <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  </div>
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                  placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {hasPasswordMismatch && (
                  <p className="text-xs text-red-400">Passwords do not match.</p>
                )}
                {passwordRequirementError && (
                  <p className="text-xs text-red-400">{passwordRequirementError}</p>
                )}
                <ul className="space-y-1 text-xs font-medium">
                  <span className='text-sm text-[#a5a6ac] mb-2'>Password Must Contains:</span>
                  {passwordChecks.map((rule) => (
                    <li key={rule.key} className="flex items-center gap-2">
                      {rule.valid ? (
                        <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-400" />
                      )}
                      <span className={rule.valid ? 'text-emerald-300' : 'text-[#a5a6ac]'}>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 mb-5">
                <button
                  type="submit"
                  disabled={disableReset}
                  className="cursor-pointer not-italic font-bold text-sm leading-[19px] tracking-[-0.02em] text-[#FFFFFF] w-full bg-[#2563EB] rounded-[10px] px-5 py-[13px] gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting password...' : 'Reset password'}
                </button>
              </div>
              <p className="text-sm text-[#a5a6ac] text-center">
                Didn&apos;t receive a code?{' '}
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300 underline disabled:opacity-50"
                >
                  Send code again
                </button>
              </p>
            </form>
          )}

          <div className="text-center">
            <p className="text-sm text-[#a5a6ac]">
              Remembered your password?{' '}
              <Link href="/sign-in" className="font-medium text-blue-400 hover:text-blue-300">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

