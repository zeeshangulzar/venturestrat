'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUserCompany } from '@hooks/useUserCompany';
import Breadcrumbs from './Breadcrumbs';

export default function HeaderClient() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileUploadStatus, setProfileUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useUser();
  const { companyName, isLoading: companyLoading } = useUserCompany();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith('/admin');

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setProfileUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress (since Clerk doesn't provide progress callbacks)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Clerk's user profile
      await user?.setProfileImage({ file });
      
      // Complete progress
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // Force user reload to update the UI
      await user?.reload();
      
      // Show success state
      setProfileUploadStatus('success');
      setTimeout(() => setProfileUploadStatus('idle'), 3000);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setProfileUploadStatus('error');
      setTimeout(() => setProfileUploadStatus('idle'), 5000);
    }
  };

  return (
    <header className="flex justify-between items-center px-5 py-4 gap-4 h-16 border-b border-[#EDEEEF]">
      <div className="flex-1">
        {!isAdminRoute && <Breadcrumbs />}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Profile Picture */}
            <div 
              className="relative w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className={`w-10 h-10 rounded-lg object-cover ${
                    profileUploadStatus === 'uploading' ? 'opacity-50' : ''
                  }`}
                />
              ) : (
                <span className="text-lg font-semibold text-blue-600">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                </span>
              )}
              
              {/* Upload Progress Overlay */}
              {profileUploadStatus === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <div className="text-white text-xs font-medium">{uploadProgress}%</div>
                </div>
              )}
              
              {/* Success/Error Indicators */}
              {profileUploadStatus === 'success' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {profileUploadStatus === 'error' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={profileUploadStatus === 'uploading'}
              />
              
              {/* Edit icon overlay to reinforce editability */}
              <div className="pointer-events-none absolute -bottom-2 -right-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" stroke="rgba(82,90,104,0.25)" strokeWidth="1.2" />
                  <path d="M8.5 14.75L8 17.5L10.75 17L16.5 11.25C17.1213 10.6287 17.1213 9.62132 16.5 9L15.5 8C14.8787 7.37868 13.8713 7.37868 13.25 8L8.5 12.75" stroke="#1E3A8A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.75 8.5L15.5 11.25" stroke="#1E3A8A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {/* User Info */}
            <div className="text-left">
              <div className="font-bold text-blue-900 text-base">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-gray-500 text-sm">
                {companyLoading ? 'Loading...' : companyName}
              </div>
            </div>
            
            {/* Dropdown Arrow */}
            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
              <svg 
                className={`w-3 h-3 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
              <SignOutButton>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-1">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
