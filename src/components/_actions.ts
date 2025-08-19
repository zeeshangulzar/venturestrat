'use server'

import { checkRole } from '@utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function setRole(formData: FormData): Promise<void> {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  // Note: checkRole should be awaited since it's an async function
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    throw new Error('Not Authorized')
  }

  try {
    await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    })
    
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

  try {
    await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    
    // Revalidate the page to show updated data
    revalidatePath('/admin/users')
  } catch (err) {
    console.error('Error removing role:', err)
    throw new Error('Failed to remove user role')
  }
}