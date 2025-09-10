'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import ThreeBageIcon from "@components/icons/ThreeBagdeIcon";
import { useUserShortlist } from '@hooks/useUserShortlist'
import ChatGPTIntegration from '@components/ChatGPTIntegration'
import EmailTabsManager from '@components/EmailTabsManager'
import { fetchUserData } from '@lib/api'

export default function FundraisingPage() {
  const { user } = useUser();
  const {
    data,
    shortlist,
    loading,
    error,
    totalShortlisted,
  } = useUserShortlist(user?.id ?? "");

  
  // State for user data
  const [userData, setUserData] = useState<{
    companyName?: string;
    businessSectors?: string[];
    stages?: string[];
    fundingAmount?: number;
    fundingCurrency?: string;
  } | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(true);
  
  // State for email generation feedback
  const [emailGenerationStatus, setEmailGenerationStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // State for triggering email list refresh
  const [emailRefreshTrigger, setEmailRefreshTrigger] = useState(0);

  // Function to trigger email list refresh
  const triggerEmailRefresh = () => {
    setEmailRefreshTrigger(prev => prev + 1);
  };

  // Load user data for ChatGPT prompt
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      setUserDataLoading(true);
      try {
        const userData = await fetchUserData(user.id);
        if (userData && typeof userData === 'object') {
          const actualUserData = (userData as { user?: { publicMetaData?: unknown } }).user || userData;
          setUserData((actualUserData as { publicMetaData?: unknown }).publicMetaData || {});
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setUserDataLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  return (
    <main className="min-h-screen bg-[#F4F6FB] h-[1441px]">
      <div className="flex bg-[#FFFFFF] items-center bg-[rgba(255, 255, 255, 0.8)] h-[60px] px-5 py-4 border-b border-[#EDEEEF]">
        <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">Fundraising CRM</h2>
        
        {/* Email Generation Status */}
        {emailGenerationStatus.type && (
          <div className={`ml-4 px-3 py-1 rounded-md text-sm ${
            emailGenerationStatus.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {emailGenerationStatus.message}
          </div>
        )}
      </div>

      {/* 3 Column Layout */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 h-[60%] overflow-auto">
         {/* Column 1 */}
         <div className="px-5 py-3 flex flex-col gap-4 h-full">
           {/* Sticky Header Section */}
           <div className="sticky top-0 bg-[#F4F6FB] z-10 pb-2">
             <div className="not-italic font-semibold text-base leading-4 tracking-tight capitalize text-[#0C2143] flex items-center gap-2 py-3">
               <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <circle cx="4" cy="4" r="4" fill="#FF6D65"/>
               </svg>
               Target
               <div className="flex flex-col justify-center items-center px-3 py-[3px] gap-2 w-[31px] h-[22px] bg-white rounded-[40px]">
                 <div className="w-[7px] h-4 font-manrope not-italic font-medium text-[12px] leading-4 tracking-[-0.02em] capitalize text-[#0C2143]">
                   {totalShortlisted}
                 </div>
               </div>
               <ThreeBageIcon />
             </div>
             <div className="flex items-center gap-2 p-3 box-border  bg-white/40 border border-dashed border-white/70 rounded-[10px] justify-center">
               <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <g clipPath="url(#clip0_741_4584)">
                 <path d="M10.333 4.16675V15.8334" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 <path d="M4.5 10H16.1667" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 </g>
                 <defs>
                 <clipPath id="clip0_741_4584">
                 <rect width="20" height="20" fill="white" transform="translate(0.333008)"/>
                 </clipPath>
                 </defs>
               </svg>
               <h2 className="not-italic font-semibold text-base leading-4 tracking-tight capitalize text-[#0C2143]"> Add New</h2>
             </div>
           </div>
           
           {/* Scrollable Content Area */}
           <div className="flex-1 overflow-y-auto">
          { user && (
            <>
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
                <ul className="space-y-4">
                  {shortlist.map((inv) => (
                    <li
                      key={inv.id}
                      className="bg-white p-4 border-[#FFFFFF] rounded-[14px] "
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="not-italic font-normal text-[14px] leading-6 tracking-[-0.02em] text-[#787F89]">Investor Name</p>
                          <p className="not-italic font-semibold text-[16px] leading-6 tracking-[-0.02em] text-[#0C2143]">
                            {inv.name}
                          </p>
                        </div>
                        <div>
                          <p className="not-italic font-normal text-[14px] leading-6 tracking-[-0.02em] text-[#787F89] flex items-center gap-1">
                            Email Address
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-auto">
                              <g clipPath="url(#clip0_752_4999)">
                              <path d="M2.25 9C2.25 9.88642 2.42459 10.7642 2.76381 11.5831C3.10303 12.4021 3.60023 13.1462 4.22703 13.773C4.85382 14.3998 5.59794 14.897 6.41689 15.2362C7.23583 15.5754 8.11358 15.75 9 15.75C9.88642 15.75 10.7642 15.5754 11.5831 15.2362C12.4021 14.897 13.1462 14.3998 13.773 13.773C14.3998 13.1462 14.897 12.4021 15.2362 11.5831C15.5754 10.7642 15.75 9.88642 15.75 9C15.75 7.20979 15.0388 5.4929 13.773 4.22703C12.5071 2.96116 10.7902 2.25 9 2.25C7.20979 2.25 5.4929 2.96116 4.22703 4.22703C2.96116 5.4929 2.25 7.20979 2.25 9Z" stroke="#787F89" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 6.75H9.00875" stroke="#787F89" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8.25 9H9V12H9.75" stroke="#787F89" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </g>
                              <defs>
                              <clipPath id="clip0_752_4999">
                              <rect width="18" height="18" fill="white"/>
                              </clipPath>
                              </defs>
                            </svg>
                          </p>
                          <p className="not-italic font-semibold text-[16px] leading-6 tracking-[-0.02em] text-[#0C2143] break-all">
                            {inv.emails?.[0]?.email || "N/A"}
                          </p>
                        </div>

                        {/* Position */}
                        <div>
                          <p className="not-italic font-normal text-[14px] leading-6 tracking-[-0.02em] text-[#787F89]">Position</p>
                          <p className="not-italic font-semibold text-[16px] leading-6 tracking-[-0.02em] text-[#0C2143]">
                            {inv.title || "—"}
                          </p>
                        </div>

                        {/* Location */}
                        <div>
                          <p className="not-italic font-normal text-[14px] leading-6 tracking-[-0.02em] text-[#787F89]">Location</p>
                          <p className="not-italic font-semibold text-[16px] leading-6 tracking-[-0.02em] text-[#0C2143]">
                            {inv.city}, {inv.country}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button className="flex-1 justify-center items-center px-5 py-2.5 gap-1 h-[39px] left-4 top-[394px] bg-[#EEF3FD] rounded-[10px] font-manrope not-italic font-medium text-[14px] leading-[19px] tracking-[-0.02em] text-[#2563EB]">
                          Contact
                        </button>
                        {user && userData && !userDataLoading && (
                          <ChatGPTIntegration
                            investor={inv}
                            user={user}
                            userData={userData}
                            onEmailGenerated={(emailContent) => {
                              setEmailGenerationStatus({
                                type: 'success',
                                message: 'Email generated successfully!'
                              });
                              // Auto-hide success message after 3 seconds
                              setTimeout(() => {
                                setEmailGenerationStatus({ type: null, message: '' });
                              }, 3000);
                            }}
                            onError={(error) => {
                              setEmailGenerationStatus({
                                type: 'error',
                                message: error
                              });
                              // Auto-hide error message after 5 seconds
                              setTimeout(() => {
                                setEmailGenerationStatus({ type: null, message: '' });
                              }, 5000);
                            }}
                            onEmailCreated={triggerEmailRefresh}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                 </ul>

               )}
               
             </>
           )}
           </div>
         </div>

        {/* Column 2 */}
        <div className="px-5 py-3 flex flex-col gap-4 h-full">
          {/* Sticky Header Section */}
          <div className="sticky top-0 bg-[#F4F6FB] z-10 pb-2">
            <div className="not-italic font-semibold text-base leading-4 tracking-tight capitalize text-[#0C2143] flex items-center gap-2 py-3">
              <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4.33301" cy="4" r="4" fill="#FFC342"/>
              </svg>
              Connected
              <div className="flex flex-col justify-center items-center px-3 py-[3px] gap-2 w-[31px] h-[22px] bg-white rounded-[40px]">
                <div className="w-[7px] h-4 font-manrope not-italic font-medium text-[12px] leading-4 tracking-[-0.02em] capitalize text-[#0C2143]">
                  0
                </div>
              </div>
              <ThreeBageIcon />
            </div>
            <div className="flex items-center gap-2 p-3 box-border  bg-white/40 border border-dashed border-white/70 rounded-[10px] justify-center">
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_741_4584)">
                <path d="M10.333 4.16675V15.8334" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.5 10H16.1667" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_741_4584">
                <rect width="20" height="20" fill="white" transform="translate(0.333008)"/>
                </clipPath>
                </defs>
              </svg>
              <h2 className="not-italic font-semibold text-base leading-4 tracking-tight capitalize text-[#0C2143]"> Add New</h2>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Content for Connected column can be added here */}
          </div>
        </div>

        {/* Column 3 */}
        <div className="px-5 py-3 flex flex-col gap-4 h-full">
          {/* Sticky Header Section */}
          <div className="sticky top-0 bg-[#F4F6FB] z-10 pb-2">
            <div className="not-italic font-semibold text-base leading-4 tracking-tight capitalize text-[#0C2143] flex items-center gap-2 py-3">
              <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4.66602" cy="4" r="4" fill="#2CEAA8"/>
              </svg>
              Interested
              <div className="flex flex-col justify-center items-center px-3 py-[3px] gap-2 w-[31px] h-[22px] bg-white rounded-[40px]">
                <div className="w-[7px] h-4 font-manrope not-italic font-medium text-[12px] leading-4 tracking-[-0.02em] capitalize text-[#0C2143]">
                  0
                </div>
              </div>
              <ThreeBageIcon />
            </div>
            <div className="flex items-center gap-2 p-3 box-border  bg-white/40 border border-dashed border-white/70 rounded-[10px] justify-center">
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_741_4584)">
                <path d="M10.333 4.16675V15.8334" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.5 10H16.1667" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_741_4584">
                <rect width="20" height="20" fill="white" transform="translate(0.333008)"/>
                </clipPath>
                </defs>
              </svg>
              <h2 className="not-italic font-semibold text-base leading-4 tracking-tight capitalize text-[#0C2143]"> Add New</h2>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Content for Interested column can be added here */}
          </div>
        </div>
      </div>
      <div className='bg-[#F4F6FB] px-4 h-fit'>
        <div className="bg-[#FFFFFF] border border-[#EDEEEF] rounded-[14px] h-full overflow-hidden">
          <div className="p-5 border-b border-[#EDEEEF]">
            <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">Mails</h2>
          </div>
          
          {user?.id ? (
            <EmailTabsManager userId={user.id} refreshTrigger={emailRefreshTrigger} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Please log in to view emails</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

