import { clerkClient } from '@clerk/nextjs/server'
import type { User } from '@clerk/nextjs/server'
import UserCard from '@components/UserCard'

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
        {/* Search form is not completed yet */}
        {/* <form className="flex items-center gap-2" action="">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search users…"
            className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
          />
          <button className="h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800">
            Search
          </button>
        </form> */}
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {users.length === 0 && (
          <div className="rounded-[14px] border border-[#EDEEEF] bg-white p-6 text-center text-slate-500">
            No users found.
          </div>
        )}

        {users.map((u) => {
          // Extract only the properties we need and ensure they are serializable
          const emailAddresses = u.emailAddresses?.map(email => ({
            id: email.id,
            emailAddress: email.emailAddress
          })) || [];
          
          const publicMetadata = {
            role: u.publicMetadata?.role as string | undefined
          };
          
          return (
            <UserCard 
              key={u.id} 
              user={{
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                emailAddresses,
                primaryEmailAddressId: u.primaryEmailAddressId,
                publicMetadata,
                createdAt: u.createdAt,
                banned: u.banned || false,
                locked: u.locked || false
              }} 
              showRoleActions={showRoleActions} 
            />
          );
        })}
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="text-slate-600">
            Page {page} of {totalPages} · {total} users
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`?search=${encodeURIComponent(search)}&page=${Math.max(1, page - 1)}`}
              className={`rounded-md border px-3 py-1.5 ${
                page <= 1 ? 'pointer-events-none opacity-40' : 'bg-white hover:bg-slate-50'
              }`}
            >
              Prev
            </a>
            <a
              href={`?search=${encodeURIComponent(search)}&page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-md border px-3 py-1.5 ${
                page >= totalPages ? 'pointer-events-none opacity-40' : 'bg-white hover:bg-slate-50'
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
