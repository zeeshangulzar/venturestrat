// app/admin/users/page.tsx (example page for the Users tab)
import UsersList from '@components/UsersList'
// import { checkRole } from '@utils/roles'
// import { redirect } from 'next/navigation'

export default async function UsersTab(props: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  // const isAdmin = await checkRole('admin')
  // if (!isAdmin) redirect('/')

  // Await searchParams before using it
  const searchParams = await props.searchParams
  const search = searchParams?.search ?? ''
  const page = Number(searchParams?.page ?? '1')

  return <UsersList search={search} page={page} pageSize={20} showRoleActions />
}

