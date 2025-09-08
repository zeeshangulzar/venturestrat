// src/components/UserShortlist.tsx
'use client'

import InvestorCard from '@components/InvestorCard'
import { useUserShortlist } from '@hooks/useUserShortlist'

export default function UserShortlist({ userId, basePath = '/investors' }: { userId: string; basePath?: string }) {
  const { data, shortlist, loading, error, totalShortlisted } = useUserShortlist(userId)

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Targeted Investors</h2>
        {data && (
          <span className="text-sm text-slate-600">
            Total: <strong>{data.totalShortlisted}</strong>
          </span>
        )}
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
          Loading targeted investors…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && data && shortlist.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
          No targeted investors yet.
        </div>
      )}

      {!loading && !error && data && shortlist.length > 0 && (
        <ul className="space-y-3">
          {shortlist.map((inv) => (
            <li key={inv.id}>
              <InvestorCard investor={inv} basePath={basePath} hideTargetButton={true} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}