'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from './Breadcrumbs';

export default function HeaderClient() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="flex justify-between items-center px-5 py-4 gap-4 h-16 border-b border-[#EDEEEF]">
      <Breadcrumbs />

      <div className="flex gap-4 items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Profile Picture */}
            <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-blue-600">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="text-left">
              <div className="font-bold text-blue-900 text-base">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-gray-500 text-sm">
                @{user?.username || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user'}
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
