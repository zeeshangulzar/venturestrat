'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk, SignOutButton } from '@clerk/nextjs';

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
import LogoIcon from './icons/logoIcon';
import RIcon from './icons/rtystIcon';

// Sidebar component
const Sidebar = () => {
  const pathname = usePathname(); // Get the current pathname
  const { signOut } = useClerk(); // Get Clerk signOut function

  // Helper function to apply active class based on current route
  const getLinkClass = (path: string) => {
    return pathname === path
      ? 'bg-[#e9effd] text-blue-600 font-semibold pl-6'
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
    <div className="w-full sm:w-[237px] h-auto sm:h-[1024px] flex-shrink-0 bg-white text-gray-800 sticky top-0 overflow-y-auto pb-6 hidden lg:block border-r border-[#EDEEEF]">
      <div className="flex items-center justify-between border-b border-[#EDEEEF] pb-4 mb-6 px-6 pt-6">
        {/* Blue Logo */}
        <div className="flex items-center">
          <LogoIcon />
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
          <RIcon />
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-[14px]">RTYST</span>
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
                 <span className='font-medium text-[14px]'>Home</span>
               </div>
             </Link>
           </div>

            <div className={getActiveWrapperClass('/task-manager')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/task-manager')}`}>
               <div className="flex items-center">
                 <TaskManagerIcon className="h-6 w-6 mr-2" />
                 <span className='font-medium text-[14px]'>Task Manager</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/legal')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/legal')}`}>
               <div className="flex items-center">
                 <LegalIcon className="h-6 w-6 mr-2" />
                 <span className='font-medium text-[14px]'>Legal</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/financials')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/financials')}`}>
               <div className="flex items-center">
                 <FinancialsIcon className="h-6 w-6 mr-2" />
                 <span className='font-medium text-[14px]'>Financials</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/presentations')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/presentations')}`}>
               <div className="flex items-center">
                 <PresentationsIcon className="h-6 w-6 mr-2" />
                 <span className='font-medium text-[14px]'>Presentations</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/business-planning')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/business-planning')}`}>
               <div className="flex items-center">
                 <BusinessPlanningIcon className="h-6 w-6 mr-2" />
                 <span className='font-medium text-[14px]'>Business Planning</span>
               </div>
             </div>
           </div>

           <div className={getActiveWrapperClass('/marketing')}>
             <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/marketing')}`}>
               <div className="flex items-center">
                 <MarketingIcon className="h-6 w-6 mr-2" />
                 <span className='font-medium text-[14px]'>Marketing</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Other Section */}
      <div className="mt-8 px-0">
        <h3 className="px-6 text-xs font-medium text-[#787F89] mb-4 font-manrope">OTHER</h3>
        <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/my-files')}`}>
          <div className="flex items-center">
            <MyFilesIcon className="h-6 w-6 mr-2" />
            <span className='font-medium text-[14px]'>My Files</span>
          </div>
        </div>
        <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/help-center')}`}>
          <div className="flex items-center">
            <HelpCenterIcon className="h-6 w-6 mr-2" />
            <span className='font-medium text-[14px]'>Help Center</span>
          </div>
        </div>
      </div>

      {/* Settings and Log Out */}
      <div className="mt-6 px-0">
        <div className={`ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer ${getLinkClass('/settings')}`}> 
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 mr-2" />
            <span className='font-medium text-[14px]'>Settings</span>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="ml-2.5 mr-2.5 block text-lg py-2 rounded-lg transition-colors cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full text-left pl-6"
        >
          <SignOutButton>
            <div className="flex items-center">
              <LogoutIcon className="h-6 w-6 mr-2" />
              <span className='font-medium text-[14px]'>Log Out</span>
            </div>
          </SignOutButton>
        </button>
      </div>

      {/* My Tasks Section (static) */}
      {/* <div className="mt-6 px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-[#787F89] font-manrope">MY TASKS</span>
          <button className="text-2xl text-[#5F6774]">+</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#232A4D] to-[#232A4D] text-white font-semibold text-lg mr-4">TC</span>
              <span className="text-gray-700 font-medium text-lg">Name Here</span>
            </div>
            <span className="bg-[#FFF1F1] text-[#FF5A5F] rounded-xl px-4 py-1 text-sm font-semibold">01</span>
          </div>
          <div className="flex items-center">
            <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#7B5CF6] to-[#7B5CF6] text-white font-semibold text-lg mr-4">WL</span>
            <span className="text-gray-700 font-medium text-lg">Name Here</span>
          </div>
          <div className="flex items-center">
            <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#34C759] to-[#34C759] text-white font-semibold text-lg mr-4">ES</span>
            <span className="text-gray-700 font-medium text-lg">Name Here</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
