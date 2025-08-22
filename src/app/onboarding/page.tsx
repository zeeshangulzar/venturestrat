// app/onboarding/page.tsx
'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Loader from '@components/Loader';

export default function OnboardingPage() {
  const { session } = useSession();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    investmentFocus: '',
    investmentStage: '',
    location: ''
  });

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading onboarding..." />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.investmentFocus) {
      alert('Please select an investment focus');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Onboarding completed successfully');
        
        // Force session reload and wait for it to complete
        await Promise.all([
          session?.reload(),
          user?.reload()
        ]);

        // Add a small delay to ensure session is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location.href for a hard redirect to bypass client-side routing
        window.location.href = '/';
        return;
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Tell us a bit about yourself to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment focus *
              </label>
              <select
                name="investmentFocus"
                value={formData.investmentFocus}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select investment focus</option>
                <option value="tech">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment stage
              </label>
              <select
                name="investmentStage"
                value={formData.investmentStage}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select investment stage</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
                <option value="series-c">Series C</option>
                <option value="growth">Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-md px-4 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Completing...' : 'Complete Onboarding'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}