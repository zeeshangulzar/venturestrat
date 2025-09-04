'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserShortlist from '@components/UserShortlist';
import { fetchUserData } from '@lib/api';
import PageLoader from '@components/PageLoader';

type UserData = {
  user?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    onboardingComplete?: boolean;
    publicMetaData?: {
      companyName?: string;
      siteUrl?: string;
      userCountry?: string;
      incorporationCountry?: string;
      operationalRegions?: string[];
      revenue?: string;
      stages?: string[];
      businessSectors?: string[];
      currency?: string;
    };
  };
  firstname?: string;
  lastname?: string;
  email?: string;
  onboardingComplete?: boolean;
  publicMetaData?: {
    companyName?: string;
    siteUrl?: string;
    userCountry?: string;
    incorporationCountry?: string;
    operationalRegions?: string[];
    revenue?: string;
    stages?: string[];
    businessSectors?: string[];
    currency?: string;
  };
};

export default function UserShowPage() {
  const params = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params?.userId as string;

  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data from backend
        const backendData = await fetchUserData(userId) as UserData | null;
        setUserData(backendData);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // Extract data from nested structure
  const actualUserData = userData?.user || userData;
  const publicMetaData = actualUserData?.publicMetaData || {};

  // Since we're only using backend data, we'll show what's available
  const primaryEmail = '—'; // Email not available from backend
  const role = '—'; // Role not available from backend
  const titleizedRole = '—';
  const created = '—'; // Created date not available from backend

  const formatArray = (arr: string[] | undefined) => {
    if (!arr || arr.length === 0) return '—';
    return arr.join(', ');
  };

  const formatCurrency = (amount: number | undefined, currency: string | undefined) => {
    if (!amount || !currency) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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

      {/* Personal Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <p className="text-slate-900">
                {actualUserData?.firstname || actualUserData?.lastname
                  ? `${actualUserData?.firstname ?? ''} ${actualUserData?.lastname ?? ''}`.trim()
                  : '—'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <p className="text-slate-900">
                {actualUserData?.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Onboarding Complete</label>
              <span
                className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  actualUserData?.onboardingComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {actualUserData?.onboardingComplete ? 'Complete' : 'Incomplete'}
              </span>
            </div>
          </div>
        </div>
      </div>

             {/* Business Information and Incorporation Country */}
       <div className="rounded-lg border border-slate-200 bg-white p-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Business Information Column */}
           <div>
             <h3 className="text-lg font-semibold text-slate-900 mb-4">
               Business Information
             </h3>
             <div className="space-y-3">
               <div>
                 <label className="text-sm font-medium text-slate-700">Operational Regions</label>
                 <p className="text-slate-900">{formatArray(publicMetaData?.operationalRegions)}</p>
               </div>
               <div>
                 <label className="text-sm font-medium text-slate-700">Revenue</label>
                 <p className="text-slate-900">{publicMetaData?.revenue || '—'}</p>
               </div>
             </div>
           </div>
           
           {/* Incorporation Country Column */}
           <div>
             <h3 className="text-lg font-semibold text-slate-900 mb-4">
               Incorporation Country
             </h3>
             <div className="space-y-3">
               <div>
                 <label className="text-sm font-medium text-slate-700">Incorporation Country</label>
                 <p className="text-slate-900">{publicMetaData?.incorporationCountry || '—'}</p>
               </div>
               <div>
                 <label className="text-sm font-medium text-slate-700">Business Sectors</label>
                 <p className="text-slate-900">{formatArray(publicMetaData?.businessSectors)}</p>
               </div>
               <div>
                 <label className="text-sm font-medium text-slate-700">Business Stages</label>
                 <p className="text-slate-900">{formatArray(publicMetaData?.stages)}</p>
               </div>
             </div>
           </div>
         </div>
       </div>
      <UserShortlist userId={userId} basePath="/admin/investors" />
    </div>
  );
}
