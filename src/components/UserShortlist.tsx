// src/components/UserShortlist.tsx
'use client'

import { useEffect, useState } from 'react'
import { getApiUrl } from '@lib/api'
import InvestorCard from '@components/InvestorCard'

type Investor = {
  id: string
  name: string
  avatar?: string
  website?: string
  phone?: string
  title?: string
  social_links?: Record<string, string>
  city: string
  state: string
  country: string
  companyName?: string
  emails: Array<{ id: string; email: string; status: string }>
  investorTypes: string[]
  stages: string[]
  markets: Array<{ market: { id: string; title: string } }>
  pastInvestments: Array<{ pastInvestment: { id: string; title: string } }>
}

type ApiInvestor = Record<string, any>

type ApiResponse = {
  user: { id: string; email: string; createdAt: string }
  shortlistedInvestors: ApiInvestor[]
  totalShortlisted: number
}

export default function UserShortlist({ userId }: { userId: string }) {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Adapter to map backend investor → InvestorCard shape
  const normalizeInvestor = (inv: ApiInvestor): Investor => {
    return {
      id: String(inv.id),
      name: inv.name ?? inv.companyName ?? inv.fundName ?? 'Unnamed Investor',
      avatar: inv.avatar ?? undefined,
      website: inv.website ?? undefined,
      phone: inv.phone ?? undefined,
      title: inv.title ?? undefined,
      social_links: inv.social_links ?? {},
      city: inv.city ?? '',
      state: inv.state ?? '',
      country: inv.country ?? '',
      companyName: inv.companyName ?? undefined,
      emails: Array.isArray(inv.emails)
        ? inv.emails
        : inv.email
          ? [{ id: 'primary', email: inv.email, status: 'UNKNOWN' }]
          : [],
      investorTypes: Array.isArray(inv.investorTypes) ? inv.investorTypes : [],
      stages: Array.isArray(inv.stages) ? inv.stages : [],
      markets: Array.isArray(inv.markets) ? inv.markets : [],
      pastInvestments: Array.isArray(inv.pastInvestments) ? inv.pastInvestments : [],
    }
  }

  useEffect(() => {
    const abort = new AbortController()
    const emptyData: ApiResponse = {
      user: { id: userId, email: '', createdAt: '' },
      shortlistedInvestors: [],
      totalShortlisted: 0,
    }

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const url = getApiUrl(`/api/user/${encodeURIComponent(userId)}/details`)
        const res = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: abort.signal,
          cache: 'no-store',
        })

        if (res.status === 404) {
          setData(emptyData)
          return
        }

        const isJson = res.headers.get('content-type')?.includes('application/json')
        const body = isJson ? await res.json().catch(() => null) : null

        if (!res.ok) {
          const msg = (body as any)?.error || `HTTP ${res.status}${!isJson ? ' (non-JSON response)' : ''}`
          throw new Error(msg)
        }

        if (!body || typeof body !== 'object') {
          throw new Error('Unexpected response from API (not JSON)')
        }

        setData(body as ApiResponse)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        setError(e.message || 'Failed to load shortlist')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => abort.abort()
  }, [userId])

  const shortlist = (data?.shortlistedInvestors ?? []).map(normalizeInvestor)

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Shortlisted Investors</h2>
        {data && (
          <span className="text-sm text-slate-600">
            Total: <strong>{data.totalShortlisted}</strong>
          </span>
        )}
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
          Loading shortlisted investors…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && data && shortlist.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
          No shortlisted investors yet.
        </div>
      )}

      {!loading && !error && data && shortlist.length > 0 && (
        <ul className="space-y-3">
          {shortlist.map((inv) => (
            <li key={inv.id}>
              <InvestorCard investor={inv} /> {/* reuse same design */}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
