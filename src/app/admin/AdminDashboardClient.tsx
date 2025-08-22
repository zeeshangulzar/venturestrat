'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UsersIcon from '@components/icons/UsersIcon';
import InvestorFocusIcon from '@components/icons/investorFocusIcon';
import { getApiUrl } from '@lib/api';

type DashboardStats = {
  totalUsers: number;
  totalInvestors: number;
  activeSessions: number;
};

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInvestors: 0,
    activeSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch users count from Clerk
        const usersResponse = await fetch('/api/admin/users/count', {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        let usersCount = 0;
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          usersCount = usersData.totalUsers || 0;
        }

        // Fetch investors count
        const investorsResponse = await fetch(getApiUrl('/api/investors?page=1&itemsPerPage=1'), {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        let investorsCount = 0;
        if (investorsResponse.ok) {
          const investorsData = await investorsResponse.json();
          investorsCount = investorsData.pagination?.totalItems || 0;
        }

        setStats({
          totalUsers: usersCount,
          totalInvestors: investorsCount,
          activeSessions: 0, // This would need a separate API endpoint
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel. Manage users and investors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Users Management Card */}
        <Link 
          href="/admin/users" 
          className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="ml-4 text-xl font-semibold text-gray-900">Users Management</h2>
          </div>
          <p className="text-gray-600 mb-4">
            View, manage, and update user accounts. Monitor user roles and permissions.
          </p>
          <div className="text-blue-600 font-medium group-hover:text-blue-700">
            Manage Users →
          </div>
        </Link>

        {/* Investors Management Card */}
        {/* <Link 
          href="/admin/investors" 
          className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <InvestorFocusIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="ml-4 text-xl font-semibold text-gray-900">Investors Management</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Browse and manage investor profiles. View detailed information and track investor data.
          </p>
          <div className="text-green-600 font-medium group-hover:text-green-700">
            Manage Investors →
          </div>
        </Link> */}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : stats.totalInvestors.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Investors</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {loading ? '...' : stats.activeSessions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Active Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
