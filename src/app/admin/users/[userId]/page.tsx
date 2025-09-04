// app/admin/users/[userId]/page.tsx
import { checkRole } from '@utils/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserShortlist from '@components/UserShortlist'
import { fetchUserData } from '@lib/api'

type UserData = {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: string;
  onboardingComplete: boolean;
  createdAt: string;
  publicMetaData?: {
    companyName?: string;
    userCountry?: string;
    revenue?: string;
    stages?: string[];
    businessSectors?: string[];
    operationalRegions?: string[];
    incorporationCountry?: string;
    [key: string]: unknown;
  };
};

export default async function UserShowPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const isAdmin = await checkRole('admin')
  if (!isAdmin) redirect('/')

  try {
    const userData = await fetchUserData(userId)

    if (!userData) {
      return (
        <div className="p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            User not found
          </div>
        </div>
      )
    }

    const user = (userData as { user: UserData }).user
    const primaryEmail = user.email

    if (!primaryEmail) {
      return (
        <div className="p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            User email not found
          </div>
        </div>
      )
    }

    const role = user.role ?? ''
    const titleizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
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
                    {user.firstname || user.lastname
                      ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900">{primaryEmail}</p>
                </div>
                {/* <div> */}
                  {/* <label className="text-sm font-medium text-slate-700">Clerk ID</label> */}
                  {/* <p className="text-slate-600 font-mono text-sm">{user.id}</p> */}
                {/* </div> */}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                { role && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Role</label>
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {titleizedRole}
                    </span>
                  </div>
                ) }
                <div>
                  <label className="text-sm font-medium text-slate-700">Created At</label>
                  <p className="text-slate-900">{created}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Onboarding Status</label>
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.onboardingComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.onboardingComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        {user.publicMetaData && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Fundraising
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.publicMetaData.companyName && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Company Name</label>
                  <p className="text-slate-900">{user.publicMetaData.companyName}</p>
                </div>
              )}
              {user.publicMetaData.userCountry && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <p className="text-slate-900">{user.publicMetaData.userCountry}</p>
                </div>
              )}
              {user.publicMetaData.revenue && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Revenue</label>
                  <p className="text-slate-900">{user.publicMetaData.revenue}</p>
                </div>
              )}
              {user.publicMetaData.stages && user.publicMetaData.stages.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Investment Stages</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.publicMetaData.stages.map((stage: string, index: number) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.publicMetaData.businessSectors && user.publicMetaData.businessSectors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Business Sectors</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.publicMetaData.businessSectors.map((sector: string, index: number) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.publicMetaData.operationalRegions && user.publicMetaData.operationalRegions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Operational Regions</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.publicMetaData.operationalRegions.map((region: string, index: number) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.publicMetaData.incorporationCountry && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Incorporation Country</label>
                  <p className="text-slate-900">{user.publicMetaData.incorporationCountry}</p>
                </div>
              )}
            </div>
          </div>
        )}

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
