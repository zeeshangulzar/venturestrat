'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
  FolderIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

// Import custom icons
import HomeIcon from './icons/HomeIcon';
import TaskManagerIcon from './icons/TaskManagerIcon';
import LegalIcon from './icons/LegalIcon';
import FinancialsIcon from './icons/FinancialsIcon';
import PresentationsIcon from './icons/PresentationsIcon';
import BusinessPlanningIcon from './icons/BusinessPlanningIcon';
import MarketingIcon from './icons/MarketingIcon';
import MyFilesIcon from './icons/MyFilesIcon';
import HelpCenterIcon from './icons/HelpCenterIcon';
import SettingsIcon from './icons/SettingsIcon';
import LogoutIcon from './icons/LogoutIcon';

// Sidebar component
const Sidebar = () => {
  const pathname = usePathname(); // Get the current pathname
  const { signOut } = useClerk(); // Get Clerk signOut function

  // Helper function to apply active class based on current route
  const getLinkClass = (path: string) => {
    return pathname === path
      ? 'bg-[#e9effd] text-blue-600 font-semibold pl-4'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 pl-6';
  };

  // Helper function to get active wrapper class
  const getActiveWrapperClass = (path: string) => {
    return pathname === path ? 'border-l-4 border-l-[#2563EB]' : '';
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="w-64 bg-white text-gray-800 sticky top-0 h-screen hidden lg:block border-r border-[#EDEEEF]">
      <div className="flex items-center justify-between border-b border-[#EDEEEF] pb-4 mb-6 px-6 pt-6">
        {/* Blue Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="RTYST" className="h-8 w-8 mr-3" />
          <span className="text-gray-900 font-semibold text-lg">RTYST</span>
        </div>
        
        {/* Collapse Button */}
        <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="31" height="31" rx="9.5" fill="white" stroke="#EDEEEF"/>
            <g clipPath="url(#clip0_295_1260)">
              <path d="M9.33325 16H17.6666" stroke="#5F6774" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.33325 16L12.6666 19.3333" stroke="#5F6774" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.33325 16L12.6666 12.6666" stroke="#5F6774" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22.6667 9.33337V22.6667" stroke="#5F6774" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_295_1260">
                <rect width="20" height="20" fill="white" transform="translate(6 6)"/>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>

      {/* Title Section */}
      <div className="px-6 mb-4">
        <div className="inline-flex items-center gap-2 bg-white border border-[#EDEEEF] px-3 py-2 rounded-lg shadow-sm w-full">
          <img src="/full-logo.png" alt="RTYST" className="h-6 w-6 rounded" />
          
          <div className="flex flex-col flex-1">
            <h2 className="text-gray-900 text-sm font-semibold leading-tight">RTYST</h2>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <p className="text-gray-500 text-xs">Active</p>
            </div>
          </div>
          <svg 
            className="w-4 h-4 text-gray-400 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>

      {/* Main Menu */}
      <div className="">
        <div className="px-6 h-[16px] font-manrope font-medium text-[12px] leading-[16px] tracking-[-0.02em] text-[#787F89]">
          MAIN MENU
        </div>
        <div className="space-y-4 mt-6">
                     <div className={getActiveWrapperClass('/')}>
             <Link href="/" className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors ${getLinkClass('/')}`}>
               <div className="flex items-center">
                 <HomeIcon className="h-6 w-6 mr-2" />
                 <span>Home</span>
               </div>
             </Link>
           </div>

                     <div className={getActiveWrapperClass('/task-manager')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/task-manager')}`}>
               <div className="flex items-center">
                 <TaskManagerIcon className="h-6 w-6 mr-2" />
                 <span>Task Manager</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/legal')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/legal')}`}>
               <div className="flex items-center">
                 <LegalIcon className="h-6 w-6 mr-2" />
                 <span>Legal</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/financials')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/financials')}`}>
               <div className="flex items-center">
                 <FinancialsIcon className="h-6 w-6 mr-2" />
                 <span>Financials</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/presentations')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/presentations')}`}>
               <div className="flex items-center">
                 <PresentationsIcon className="h-6 w-6 mr-2" />
                 <span>Presentations</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/business-planning')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/business-planning')}`}>
               <div className="flex items-center">
                 <BusinessPlanningIcon className="h-6 w-6 mr-2" />
                 <span>Business Planning</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/marketing')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/marketing')}`}>
               <div className="flex items-center">
                 <MarketingIcon className="h-6 w-6 mr-2" />
                 <span>Marketing</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Other Section */}
      <div className="mt-10 px-6">
        <h3 className="text-xs font-medium text-[#787F89] mb-4 font-manrope">OTHER</h3>
        <div className={`block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/my-files')}`}>
          <div className="flex items-center">
            <MyFilesIcon className="h-6 w-6 mr-2" />
            <span>My Files</span>
          </div>
        </div>

        <div className={`block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/help-center')}`}>
          <div className="flex items-center">
            <HelpCenterIcon className="h-6 w-6 mr-2" />
            <span>Help Center</span>
          </div>
        </div>
      </div>

      {/* Settings and Log Out */}
      <div className="mt-10 px-6">
        <div className={`block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/settings')}`}>
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 mr-2" />
            <span>Settings</span>
          </div>
        </div>
                  <button 
            onClick={handleSignOut}
            className="block text-lg py-2 rounded-lg transition-colors cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-50 pl-6 w-full text-left"
          >
            <div className="flex items-center">
              <LogoutIcon className="h-6 w-6 mr-2" />
              <span>Log Out</span>
            </div>
          </button>
      </div>
    </div>
  );
};

export default Sidebar;
