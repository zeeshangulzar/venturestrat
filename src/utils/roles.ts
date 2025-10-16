// utils/roles.ts
import { Roles } from '../types/globals'
import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

export const checkRole = async (role: Roles) => {
  try {
    // Try to get the current pathname from headers
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || headersList.get('referer') || ''
    
    // If we're on an admin route, allow access (basic auth already validated)
    if (pathname.includes('/admin')) {
      console.log('🔓 Admin route detected, allowing access without Clerk role check')
      return true
    }
  } catch (error) {
    // If we can't determine the pathname, fall back to checking if we have a valid Clerk session
    console.log('⚠️ Could not determine route, checking Clerk session')
  }
  
  // For non-admin routes or when pathname is unclear, check Clerk authentication
  console.log('🔐 Checking Clerk role:', role)
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role === role
}
