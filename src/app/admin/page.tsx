// app/admin/users/page.tsx
import { checkRole } from '@utils/roles'
import { redirect } from 'next/navigation'

export default async function UsersTab() {
  const isAdmin = await checkRole('admin')
  if (!isAdmin) redirect('/')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome to the admin panel</h1>
    </div>
  )
}
