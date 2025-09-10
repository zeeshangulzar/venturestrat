'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
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

      {/* Table Layout */}
      <div className="mt-6 px-5 py-3">
        <div className="bg-white rounded-[14px] border border-[#EDEEEF] overflow-hidden">
          {/* Sticky Table Header */}
          <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-[#EDEEEF]">
            <h3 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">
              Target
            </h3>
          </div>

          {/* Table Content with Scrollable Container */}
          <div className="max-h-[400px] overflow-auto">
            {user && (
              <>
                {loading && (
                  <div className="px-6 py-8 text-center text-slate-600">
                    Loading targeted investors…
                  </div>
                )}

                {error && (
                  <div className="px-6 py-8 text-center text-rose-700">
                    {error}
                  </div>
                )}

                {!loading && !error && data && shortlist.length === 0 && (
                  <div className="px-6 py-8 text-center text-slate-600">
                    No targeted investors yet.
                  </div>
                )}

                {!loading && !error && data && shortlist.length > 0 && (
                  <table className="w-full table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#F6F6F7]">
                      <tr>
                        <th className="w-[20%] px-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Investor Name
                        </th>
                        <th className="w-[20%] px-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Company Name
                        </th>
                        <th className="w-[25%] px-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Email Address
                        </th>
                        <th className="w-[15%] px-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Position
                        </th>
                        <th className="w-[15%] px-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Location
                        </th>
                        <th className="w-[25%] px-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shortlist.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="w-[20%] px-4 py-4">
                            <div className="not-italic font-semibold text-[16px] leading-[24px] text-[#0C2143] truncate">
                              {inv.name}
                            </div>
                          </td>
                          <td className="w-[20%] px-4 py-4">
                            <div className="not-italic font-semibold text-[16px] leading-[24px] text-[#0C2143] truncate">
                              {inv.companyName || "N/A"}
                            </div>
                          </td>
                          <td className="w-[25%] px-4 py-4">
                            <div className="not-italic font-medium text-base leading-6 tracking-[-0.02em] text-[#0C2143] truncate">
                              {inv.emails?.[0]?.email || "N/A"}
                            </div>
                          </td>
                          <td className="w-[15%] px-4 py-4">
                            <div className="not-italic font-medium text-base leading-6 tracking-[-0.02em] text-[#0C2143] truncate">
                              {inv.title || "—"}
                            </div>
                          </td>
                          <td className="w-[15%] px-4 py-4">
                            <div className="not-italic font-medium text-base leading-6 tracking-[-0.02em] text-[#0C2143] truncate">
                              {inv.city}, {inv.country}
                            </div>
                          </td>
                          <td className="w-[25%] px-4 py-4">
                            <div className="flex gap-[20px] flex-wrap">
                              <button className="bg-[rgba(218,156,22,0.14)] px-4 py-2 rounded-[40px] font-medium text-[14px] not-italic text-sm leading-6 text-[#C58A09] whitespace-nowrap">
                                Contacted
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
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

