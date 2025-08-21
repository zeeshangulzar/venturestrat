// app/(public)/sign-in/page.tsx
'use client'

import * as React from 'react'
import { useSignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loader from '@components/Loader'
import LogoIcon from '@components/icons/LogoWithText';

export default function SignInPage() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()
  const { user, isLoaded: userLoaded } = useUser()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

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
        <Loader size="lg" text="Loading sign-in page..." />
      </div>
    );
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
        // The middleware will handle redirecting to onboarding if needed
        router.replace('/')
      } else {
        // e.g. needs second factor; handle other statuses if you enabled them
        setError('Additional verification required')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    if (!isLoaded || !signIn) return
    // Redirect-based OAuth
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',      // where Clerk returns to
      redirectUrlComplete: '/' // after Clerk finishes, land here (middleware handles onboarding)
    })
  }

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
            <h1 className="text-2xl font-bold text-[#ffffff]">Sign in to your account</h1>
            <p className="mt-2 text-sm text-[#a5a6ac]">Welcome back! Please sign in to continue.</p>
          </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              className="text-[#5e6269] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <input
              type="password"
              className="text-[#5e6269] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

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
            Don't have an account?{' '}
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
