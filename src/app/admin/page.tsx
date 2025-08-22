// app/admin/users/page.tsx
import { checkRole } from '@utils/roles'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  const isAdmin = await checkRole('admin')
  if (!isAdmin) redirect('/')

  return <AdminDashboardClient />;
}
