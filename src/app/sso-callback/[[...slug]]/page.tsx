// app/sso-callback/[[...slug]]/page.tsx
'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import PageLoader from '@components/PageLoader'

export default function SSOCallback() {
  // Clerk finalizes the OAuth flow here, then uses redirectUrlComplete
  return (
    <>
      <PageLoader message="Completing sign-in..." />
      <AuthenticateWithRedirectCallback />
    </>
  )
}
