// app/sso-callback/[[...slug]]/page.tsx
'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import AuthLoadingScreen from '@components/AuthLoadingScreen'

export default function SSOCallback() {
  // Clerk finalizes the OAuth flow here, then uses redirectUrlComplete
  return (
    <>
      <AuthLoadingScreen message="Completing authentication..." />
      <AuthenticateWithRedirectCallback />
    </>
  )
}
