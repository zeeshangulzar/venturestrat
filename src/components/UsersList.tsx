'use client'

import { setRole } from '@components/_actions'
import { useEffect, useState, useTransition } from 'react'
import { getApiUrl } from '@lib/api';

type PublicMetaData = {
  companyName?: string;
  position?: string;
  userCountry?: string;
  incorporationCountry?: string;
  [key: string]: unknown;
};

type BackendUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  onboardingComplete: boolean;
  publicMetaData: PublicMetaData;
  createdAt: number;
  banned: boolean;
  locked: boolean;
};

type UsersListProps = {
  search?: string
  page?: number
  pageSize?: number
  showRoleActions?: boolean
}

export default function UsersList({
  search = '',
  page = 1,
  pageSize = 20,
  showRoleActions = false,
}: UsersListProps) {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        
        const params = new URLSearchParams({
          search: search || '',
          page: page.toString(),
          pageSize: pageSize.toString()
        });

        const response = await fetch(`/api/admin/users?${params}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setTotal(data.total);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [search, page, pageSize])

  const totalPages = pagination.totalPages || Math.max(1, Math.ceil(total / pageSize))

  // Helper function to titleize role
  const titleizeRole = (role: string | undefined) => {
    if (!role) return ''
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Function to handle role updates
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setPendingUpdates(prev => new Set(prev).add(userId))
    
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('id', userId)
        formData.append('role', newRole)
        
        await setRole(formData)
        
        // Update local state immediately
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, role: newRole }
              : user
          )
        )
      } catch (error) {
        console.error('Error updating role:', error)
        // Optionally show error message to user
      } finally {
        setPendingUpdates(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      }
    })
  }

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

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6 text-center text-slate-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No users found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Manage Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => {
                const fullName = user.firstName || user.lastName
                  ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                  : '—'
                const email = user.email || '—'
                const role = titleizeRole(user.role)
                const createdDate = formatDate(user.createdAt)
                const company = user.publicMetaData?.companyName || '—'
                const location = user.publicMetaData?.userCountry || '—'
                const currentRole = user.role

                return (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50 group cursor-pointer"
                    onClick={() => window.location.href = `/admin/users/${user.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      {email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      { role && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {role}
                          {pendingUpdates.has(user.id) && (
                            <span className="ml-1 inline-block h-2 w-2 animate-spin rounded-full border border-slate-400 border-t-transparent"></span>
                          )}
                        </span>
                      ) }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      {company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      {location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      {createdDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      {showRoleActions && (
                        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {
                            <>
                              {currentRole !== 'admin' && (
                                <button
                                  type="button"
                                  disabled={pendingUpdates.has(user.id)}
                                  onClick={() => handleRoleUpdate(user.id, 'admin')}
                                  className="cursor-pointer inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {pendingUpdates.has(user.id) ? 'Updating...' : 'Make Admin'}
                                </button>
                              )}
                              {currentRole !== 'moderator' && (
                                <button
                                  type="button"
                                  disabled={pendingUpdates.has(user.id)}
                                  onClick={() => handleRoleUpdate(user.id, 'moderator')}
                                  className="cursor-pointer inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {pendingUpdates.has(user.id) ? 'Updating...' : 'Make Moderator'}
                                </button>
                              )}
                            </>
                          }
                          
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="text-slate-600">
            Page {pagination.page || page} of {totalPages} · {pagination.totalCount || total} users
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`?search=${encodeURIComponent(search)}&page=${Math.max(1, (pagination.page || page) - 1)}`}
              className={`rounded-md border px-3 py-1.5 ${
                !pagination.hasPrevPage && (pagination.page || page) <= 1 ? 'pointer-events-none opacity-40' : 'bg-white hover:bg-slate-50'
              }`}
            >
              Prev
            </a>
            <a
              href={`?search=${encodeURIComponent(search)}&page=${Math.min(totalPages, (pagination.page || page) + 1)}`}
              className={`rounded-md border px-3 py-1.5 ${
                !pagination.hasNextPage && (pagination.page || page) >= totalPages ? 'pointer-events-none opacity-40' : 'bg-white hover:bg-slate-50'
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
