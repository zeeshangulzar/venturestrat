// SERVER COMPONENT
import { clerkClient } from '@clerk/nextjs/server'
import type { User } from '@clerk/nextjs/server'
import Link from 'next/link'
import { setRole, removeRole } from '@components/_actions'

type UsersListProps = {
  search?: string
  page?: number
  pageSize?: number
  showRoleActions?: boolean
}

// Use Clerk's backend User type directly
type ClerkUser = User

export default async function UsersList({
  search = '',
  page = 1,
  pageSize = 20,
  showRoleActions = false,
}: UsersListProps) {
  // In newer Clerk, clerkClient is a function that returns a backend client
  const client = await clerkClient()

  // Clerk pagination (limit/offset)
  const limit = pageSize
  const offset = (Math.max(1, page) - 1) * pageSize

  const resp = await client.users.getUserList({
    query: search || undefined,
    limit,
    offset,
    orderBy: '-created_at',
  })

  const users = resp.data as ClerkUser[]
  const total = resp.totalCount ?? users.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header / controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold">Users</h2>

        <form className="flex items-center gap-2" action="">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search users…"
            className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
          />
          <button className="h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800">
            Search
          </button>
        </form>
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {users.length === 0 && (
          <div className="rounded-[14px] border border-[#EDEEEF] bg-white p-6 text-center text-slate-500">
            No users found.
          </div>
        )}

        {users.map((u) => (
          <UserCard key={u.id} user={u} showRoleActions={showRoleActions} />
        ))}
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="text-slate-600">
            Page {page} of {totalPages} · {total} users
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`?search=${encodeURIComponent(search)}&page=${Math.max(1, page - 1)}`}
              className={`rounded-md border px-3 py-1.5 ${
                page <= 1 ? 'pointer-events-none opacity-40' : 'bg-white hover:bg-slate-50'
              }`}
            >
              Prev
            </Link>
            <Link
              href={`?search=${encodeURIComponent(search)}&page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-md border px-3 py-1.5 ${
                page >= totalPages ? 'pointer-events-none opacity-40' : 'bg-white hover:bg-slate-50'
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function UserCard({
  user,
  showRoleActions,
}: {
  user: ClerkUser
  showRoleActions: boolean
}) {
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? '—'
  const role = (user.publicMetadata?.role as string | undefined) ?? ''
  const created = user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'

  return (
    <div className="group w-full rounded-[14px] border border-[#EDEEEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col flex-row-1150 gap-4 lg:gap-0">
        {/* Column 1: Identity (clickable) */}
        <Link
          href={`/admin/users/${user.id}`}
          className="flex min-w-0 flex-1 items-start gap-4 lg:max-w-[400px] pt-4 pb-2 lg:pb-6 px-4 hover:bg-slate-50/40 rounded-[14px_14px_0_0] lg:rounded-none"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[16px] font-semibold text-slate-900">
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ''} ${user.lastName ?? ''}`
                  : '—'}
              </h3>
            </div>

            <p className="mt-1 text-[13px] sm:text-[14px] text-slate-600 truncate">
              {primaryEmail}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center justify-center rounded-[999px] bg-[var(--Primary-P20,#F6F9FE)] px-[10px] py-[5.5px] text-[11px] sm:text-[12px] font-medium text-[var(--Dark-D500,#525A68)]">
                ID: {user.id}
              </span>
            </div>
          </div>
        </Link>

        {/* Divider: horizontal on mobile, vertical on lg+ */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] lg:hidden" />
        <div className="hidden lg:block w-px flex-shrink-0 border border-[var(--Dark-D20,#F6F6F7)]" />

        {/* Column 2: Meta (clickable) */}
        <Link
          href={`/admin/users/${user.id}`}
          className="flex flex-col lg:flex-row flex-wrap gap-3 lg:max-w-md pt-2 lg:pt-4 pb-2 lg:pb-6 px-4 hover:bg-slate-50/40"
        >
          <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-[200px] overflow-hidden">
            <span className="truncate text-[13px] sm:text-[14px] text-slate-900 font-semibold">
              Role
            </span>
            <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {role || '—'}
            </span>
          </div>

          <div className="flex items-center gap-2 w/full sm:w-1/2 lg:w-[200px] overflow-hidden">
            <span className="truncate text-[13px] sm:text-[14px] text-slate-900 font-semibold">
              Created
            </span>
            <span className="ml-auto truncate text-[13px] sm:text-[14px] text-slate-600">
              {created}
            </span>
          </div>
        </Link>

        {/* Divider */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] lg:hidden" />
        <div className="hidden lg:block w-px flex-shrink-0 border border-[var(--Dark-D20,#F6F6F7)]" />

        {/* Column 3: Actions (NOT clickable — buttons work normally) */}
        <div className="flex lg:flex-1 flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-6 px-4 pt-2 lg:pt-4 pb-4 lg:pb-6">
          <div className="text-[13px] sm:text-[14px] text-[var(--Dark-D500,#525A68)]">
            Manage Role
          </div>

          {showRoleActions && (
            <div className="flex flex-wrap items-center gap-2">
              <form action={setRole}>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="role" value="admin" />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Make Admin
                </button>
              </form>

              <form action={setRole}>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="role" value="moderator" />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Make Moderator
                </button>
              </form>

              <form action={removeRole}>
                <input type="hidden" name="id" value={user.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                >
                  Remove Role
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
