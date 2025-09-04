'use server'

import { checkRole } from '@utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getApiUrl } from '@lib/api'

export async function setRole(formData: FormData): Promise<void> {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  // Note: checkRole should be awaited since it's an async function
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    throw new Error('Not Authorized')
  }

  const userId = formData.get('id') as string
  const role = formData.get('role') as string

  try {
    // Update role in Clerk
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: role },
    })

    // Also sync the role to backend
    try {
      const backendResponse = await fetch(getApiUrl(`/api/user/${userId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role
        }),
      })

      if (!backendResponse.ok) {
        console.warn(`Failed to sync role to backend for user ${userId}: ${backendResponse.status}`)
        // Don't throw error here as Clerk update was successful
      } else {
        console.log(`Role synced to backend for user ${userId}`)
      }
    } catch (backendError) {
      console.warn('Error syncing role to backend:', backendError)
      // Don't throw error here as Clerk update was successful
    }
    
    // Revalidate the page to show updated data
    revalidatePath('/admin/users')
  } catch (err) {
    console.error('Error setting role:', err)
    throw new Error('Failed to set user role')
  }
}

export async function removeRole(formData: FormData): Promise<void> {
  const client = await clerkClient()

  // Check that the user trying to remove the role is an admin
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    throw new Error('Not Authorized')
  }

  const userId = formData.get('id') as string

  try {
    // Remove role in Clerk
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: null },
    })

    // Also sync the role removal to backend
    try {
      const backendResponse = await fetch(getApiUrl(`/api/user/${userId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: null
        }),
      })

      if (!backendResponse.ok) {
        console.warn(`Failed to sync role removal to backend for user ${userId}: ${backendResponse.status}`)
        // Don't throw error here as Clerk update was successful
      } else {
        console.log(`Role removal synced to backend for user ${userId}`)
      }
    } catch (backendError) {
      console.warn('Error syncing role removal to backend:', backendError)
      // Don't throw error here as Clerk update was successful
    }
    
    // Revalidate the page to show updated data
    revalidatePath('/admin/users')
  } catch (err) {
    console.error('Error removing role:', err)
    throw new Error('Failed to remove user role')
  }
}

export async function setDefaultRole(userId: string): Promise<void> {
  try {
    const client = await clerkClient()
    
    // Set default role to moderator for new users
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'moderator' },
    })

    // Also sync the default role to backend
    try {
      const backendResponse = await fetch(getApiUrl(`/api/user/${userId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'moderator'
        }),
      })

      if (!backendResponse.ok) {
        console.warn(`Failed to sync default role to backend for user ${userId}: ${backendResponse.status}`)
      } else {
        console.log(`Default role synced to backend for user ${userId}`)
      }
    } catch (backendError) {
      console.warn('Error syncing default role to backend:', backendError)
    }
    
    console.log(`Default role 'moderator' set for user: ${userId}`)
  } catch (err) {
    console.error('Error setting default role:', err)
    // Don't throw error here as this is a default action that shouldn't break sign up
  }
}