// app/admin/users/[userId]/page.tsx
import { clerkClient } from '@clerk/nextjs/server'
import { checkRole } from '@utils/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserShortlist from '@components/UserShortlist'

export default async function UserShowPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const isAdmin = await checkRole('admin')
  if (!isAdmin) redirect('/')

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress

    if (!primaryEmail) {
      return (
        <div className="p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            User email not found
          </div>
        </div>
      )
    }

    const role = (user.publicMetadata?.role as string | undefined) ?? 'user'
    const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'

    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
              ← Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
          </div>
        </div>

        {/* User Info Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <p className="text-slate-900">
                    {user.firstName || user.lastName
                      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900">{primaryEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Clerk ID</label>
                  <p className="text-slate-600 font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {role}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <p className="text-slate-900">{created}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.banned ? 'Banned' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UserShortlist userId={user.id} basePath="/admin/investors" />
      </div>
    )
  } catch (error) {
    console.error('Error fetching user:', error)
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Error loading user details
        </div>
      </div>
    )
  }
}
