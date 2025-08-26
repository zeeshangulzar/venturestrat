// app/admin/page.tsx
import { checkRole } from '@utils/roles'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const isAdmin = await checkRole('admin')
  if (!isAdmin) redirect('/')

  // Redirect admin users to the users list page
  redirect('/admin/users')
}
