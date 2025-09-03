// app/(public)/sign-in/page.tsx
'use client'

import * as React from 'react'
import { useSignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageLoader from '@components/PageLoader'
import LogoIcon from '@components/icons/LogoWithText';
import Logo from '@components/icons/logoIcon';
import SignInLogo from '@components/icons/SignInLogo';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { setDefaultRole } from '@components/_actions'


export default function SignInPage() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()
  const { user, isLoaded: userLoaded } = useUser()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      // For sign-in page, we'll let the AuthFlowManager handle the onboarding check
      // This prevents conflicts between different onboarding status checks
      // Just redirect to home and let the AuthFlowManager determine the correct flow
      window.location.href = '/'
    }
  }, [user, router])

  // Show loading state only when Clerk is determining authentication status
  // Don't show loading if we're already on the sign-in page and user is not authenticated
  if (!isLoaded || !userLoaded) {
    // Only show loading if we're not sure about the user state
    // If userLoaded is false but we're on sign-in page, don't show loading
    if (!userLoaded && !user) {
      return <PageLoader message="Loading sign-in page..." />;
    }
    // If isLoaded is false, show minimal loading
    if (!isLoaded) {
      return <PageLoader message="Initializing..." />;
    }
  }

  // Don't render if user is already signed in
  if (user) {
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setError(null)
    setLoading(true)
    try {
      const res = await signIn.create({
        identifier: email,
        password,
      })

      if (res.status === 'complete') {
        await setActive!({ session: res.createdSessionId })
        // Use window.location.href for a hard redirect to ensure page reloads like sign-up
        window.location.href = '/'
      } else {
        // e.g. needs second factor; handle other statuses if you enabled them
        setError('Additional verification required')
      }
    } catch (err: unknown) {
      let errorMessage = 'Sign in failed';
      
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray((err as { errors: unknown[] }).errors) && (err as { errors: unknown[] }).errors.length > 0) {
        const firstError = (err as { errors: unknown[] }).errors[0];
        if (firstError && typeof firstError === 'object' && 'message' in firstError) {
          errorMessage = String(firstError.message) || 'Sign in failed';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    if (!isLoaded || !signIn) return
    setError(null)
    setGoogleLoading(true)
    
    try {
      // Redirect-based OAuth
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',      // where Clerk returns to
        redirectUrlComplete: '/' // after Clerk finishes, land here (middleware handles onboarding)
      })
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0c2143] relative w-full">
      {/* Top left logo */}
      <div className="absolute top-6 left-6">
        <LogoIcon />
      </div>
      
      {/* Center content */}
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 p-8 shadow-[0_0_15px_5px_rgba(37,99,235,0.1)] bg-[#1b2130] rounded-[14px] border border-[rgba(37,99,235,0.1)]">
          <div className="text-center">
            <div className="flex items-center justify-center mb-5 gap-2">
              <Logo className='w-[20px] h-[20px]'/><SignInLogo />
            </div>
            <h1 className="text-2xl font-bold text-[#ffffff]">Sign in to your account</h1>
            <p className="mt-2 text-sm text-[#a5a6ac]">Welcome back! Please sign in to continue.</p>
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

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              className="cursor-pointer h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="jeff@amazon.com"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="h-[42] w-full font-normal text-sm leading-5 bg-[#0C111D] text-[#FFFFFF] border border-[#ffffff1a] rounded-[10px] px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center w-10 h-full"
              onClick={() => setShowPassword(!showPassword)}
            >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            )}
            </button>
          </div>

          <div className='mt-[72px] mb-5'>
            <button 
              type="submit" 
              disabled={loading} 
              className="cursor-pointer not-italic font-bold text-sm leading-[19px] tracking-[-0.02em] text-[#FFFFFF] w-full bg-[#2563EB] rounded-[10px] px-5 py-[13px] gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <span className="inline-flex items-center gap-1">
                  Sign in
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1121_3914)">
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

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-[#FFFFFF]">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={onGoogle}
          disabled={googleLoading}
          className="cursor-pointer h-[46px] w-full bg-[rgba(255, 255, 255, 0.1)] text-[#FFFFFF] border not-italic font-small text-sm leading-[19px] tracking-[-0.02em] rounded-[10px] px-4 py-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in with Google...
            </div>
          ) : (
            <span className="inline-flex items-center gap-1">
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.325 8.23735H18.6V8.2H10.5V11.8H15.5864C14.8443 13.8956 12.8504 15.4 10.5 15.4C7.51785 15.4 5.1 12.9822 5.1 10C5.1 7.01785 7.51785 4.6 10.5 4.6C11.8765 4.6 13.1289 5.1193 14.0824 5.96755L16.6281 3.4219C15.0207 1.92385 12.8706 1 10.5 1C5.52975 1 1.5 5.02975 1.5 10C1.5 14.9703 5.52975 19 10.5 19C15.4703 19 19.5 14.9703 19.5 10C19.5 9.39655 19.4379 8.8075 19.325 8.23735Z" fill="#FFC107"/>
                <path d="M2.53781 5.81095L5.49476 7.9795C6.29486 5.9986 8.23245 4.6 10.5 4.6C11.8765 4.6 13.1289 5.1193 14.0824 5.96755L16.6281 3.4219C15.0207 1.92385 12.8706 1 10.5 1C7.0431 1 4.04531 2.95165 2.53781 5.81095Z" fill="#FF3D00"/>
                <path d="M10.5 19C12.8247 19 14.9367 18.1105 16.5337 16.6638L13.7482 14.3067C12.8142 15.017 11.6734 15.4009 10.5 15.4C8.1591 15.4 6.1711 13.9075 5.4223 11.8245L2.4874 14.0857C3.9769 17.0004 7.00215 19 10.5 19Z" fill="#4CAF50"/>
                <path d="M19.325 8.23735H18.6V8.2H10.5V11.8H15.5864C15.2314 12.7974 14.5917 13.6691 13.7469 14.3071L13.7482 14.3067L16.5337 16.6638C16.3366 16.8429 19.5 14.5 19.5 10C19.5 9.39655 19.4379 8.8075 19.325 8.23735Z" fill="#1976D2"/>
              </svg>
              Continue with<span className='font-medium'>Google</span>
            </span>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-[#a5a6ac]">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="font-medium text-blue-400 hover:text-blue-300">
              Create an account
            </Link>
          </p>
        </div>
        </div>
      </div>
    </main>
  )
}
