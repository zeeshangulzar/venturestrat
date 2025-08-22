// app/sso-callback/[[...slug]]/page.tsx
'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallback() {
  // Clerk finalizes the OAuth flow here, then uses redirectUrlComplete
  return <AuthenticateWithRedirectCallback />
}
