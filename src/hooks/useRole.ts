'use client'

import { useUser } from '@clerk/nextjs'
import { Roles } from '../types/globals'

export function useRole() {
  const { user, isLoaded } = useUser()
  
  const checkRole = (role: Roles): boolean => {
    if (!isLoaded || !user) return false
    return user.publicMetadata?.role === role
  }
  
  const isAdmin = checkRole('admin')
  const isModerator = checkRole('moderator')
  
  return {
    isAdmin,
    isModerator,
    checkRole,
    isLoaded,
    user
  }
}
