// app/sso-callback/[[...slug]]/page.tsx
'use client'

import { AuthenticateWithRedirectCallback, useUser } from '@clerk/nextjs'
import PageLoader from '@components/PageLoader'
import { useEffect, useState } from 'react'
import { setDefaultRole } from '@components/_actions'

export default function SSOCallback() {
  const { user, isLoaded } = useUser()
  const [roleSet, setRoleSet] = useState(false)

  useEffect(() => {
    console.log('SSO Callback - User state:', { user: !!user, isLoaded, roleSet })
    console.log('SSO Callback - Current URL:', window.location.href)
    console.log('SSO Callback - URL params:', window.location.search)
    
    if (isLoaded && user && !roleSet) {
      const ensureDefaultRole = async () => {
        try {
          // Check if user has a role, if not set default role
          const currentRole = (user.publicMetadata as { role?: string })?.role
          if (!currentRole) {
            console.log('Setting default role for OAuth user:', user.id)
            await setDefaultRole(user.id)
          }
          setRoleSet(true)
        } catch (error) {
          console.error('Error setting default role:', error)
          setRoleSet(true) // Continue anyway to avoid blocking the flow
        }
      }
      
      ensureDefaultRole()
    }
  }, [isLoaded, user, roleSet])

  // Clerk finalizes the OAuth flow here, then uses redirectUrlComplete
  return (
    <>
      <PageLoader message="Completing sign-in..." />
      <AuthenticateWithRedirectCallback />
    </>
  )
}
