'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { useUserShortlist } from '@hooks/useUserShortlist'
import ChatGPTIntegration from '@components/ChatGPTIntegration'
import EmailTabsManager from '@components/EmailTabsManager'
import InvestorStatusDropdown from '@components/InvestorStatusDropdown'
import Tooltip from '@components/Tooltip'
import Loader from '@components/Loader'
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
    stages?: string;
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
  
  // State for selecting a specific email ID
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isAIEmail, setIsAIEmail] = useState<boolean>(false);

  // State for shortlist to allow immediate UI updates
  const [shortlistState, setShortlistState] = useState(shortlist);

  // State for full-page loader
  const [showFullPageLoader, setShowFullPageLoader] = useState(true);

  // Ref for the table's scroll container
  const tableScrollContainerRef = useRef<HTMLDivElement>(null);

  // Update shortlist state when data changes
  useEffect(() => {
    setShortlistState(shortlist);
  }, [shortlist.length, shortlist.map(inv => inv.id).join(',')]);

  // Hide full-page loader when table is ready with timeout
  useEffect(() => {
    if (!loading && data) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowFullPageLoader(false);
      }, 1000); // 1 second timeout

      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  // Function to trigger email list refresh
  const triggerEmailRefresh = () => {
    setEmailRefreshTrigger(prev => prev + 1);
  };

  // Function to update investor status
  const updateInvestorStatus = (shortlistId: string, newStatus: string) => {
    setShortlistState(prev => 
      prev.map(inv => 
        inv.shortlistId === shortlistId 
          ? { ...inv, status: newStatus }
          : inv
      )
    );
  };
  
  // Function to select a specific email
  const selectEmail = (emailId: string, isAI?: boolean) => {
    // For AI emails, always force a fresh fetch by using a unique timestamp
    if (isAI) {
      const uniqueId = `${emailId}_${Date.now()}`;
      setSelectedEmailId(uniqueId);
      setIsAIEmail(true);
    } else {
      // Clear current selection first to force fresh data fetch
      // This handles the case where backend returns existing email instead of new one
      setSelectedEmailId(null);
      setIsAIEmail(false);
      // Use setTimeout to ensure the null state is processed before setting the new ID
      setTimeout(() => {
        setSelectedEmailId(emailId);
        setIsAIEmail(isAI || false);
      }, 0);
    }
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
    <main className="min-h-screen bg-[#F4F6FB] h-auto pb-[16px] relative">
      {/* Loader overlay - positioned at top section */}
      {showFullPageLoader && (
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-[#F4F6FB] z-40 flex items-center justify-center">
          <Loader 
            size="xl" 
            text="Loading Fundraising CRM..." 
            textColor="text-[#0C2143]"
            spinnerColor="border-[#0C2143]"
            className="py-8"
          />
        </div>
      )}

      {/* Main content - always rendered but loader covers it */}
      <div className={showFullPageLoader ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
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
                  My List
                </h3>
              </div>

              {/* Table Content with Scrollable Container */}
              <div ref={tableScrollContainerRef} className="max-h-[400px] overflow-auto">
                {error && (
                  <div className="px-6 py-8 text-center text-rose-700">
                    {error}
                  </div>
                )}

                {!error && data && shortlist.length === 0 && (
                  <div className="px-6 py-8 text-center text-slate-600">
                    No targeted investors yet.
                  </div>
                )}

                {!error && data && shortlistState.length > 0 && (
                  <table className="w-full table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#F6F6F7]">
                      <tr>
                        <th className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] pl-4 py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] px-4">
                          Investor Name
                        </th>
                        <th className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] px-4">
                          Company Name
                        </th>
                        <th className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] px-4">
                          Email Address
                        </th>
                        <th className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] px-4">
                          Location
                        </th>
                        <th className="w-[36%] lg:w-[36%] xl:w-[32%] 2xl:w-[24%] py-4 text-left not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shortlistState.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] pl-4 py-4 px-4">
                            <Tooltip content={inv.name}>
                              <div 
                                className="not-italic font-semibold text-[16px] leading-[24px] text-[#0C2143] truncate max-w-full overflow-hidden"
                                style={{ maxWidth: '200px' }}
                              >
                                {inv.name}
                              </div>
                            </Tooltip>
                          </td>
                          <td className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] py-4 px-4">
                            <Tooltip content={inv.companyName || "N/A"}>
                              <div 
                                className="not-italic font-semibold text-[16px] leading-[24px] text-[#0C2143] truncate max-w-full overflow-hidden"
                                style={{ maxWidth: '200px' }}
                              >
                                {inv.companyName || "N/A"}
                              </div>
                            </Tooltip>
                          </td>
                          <td className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] py-4 px-4">
                            <Tooltip content={inv.emails?.[0]?.email || "N/A"}>
                              <div 
                                className="not-italic font-medium text-base leading-6 tracking-[-0.02em] text-[#0C2143] truncate max-w-full overflow-hidden"
                                style={{ maxWidth: '250px' }}
                              >
                                {inv.emails?.[0]?.email || "N/A"}
                              </div>
                            </Tooltip>
                          </td>
                          <td className="w-[16%] lg:w-[16%] xl:w-[17%] 2xl:w-[18%] py-4 px-4">
                            <Tooltip content={inv.state ? `${inv.state}, ${inv.country}` : inv.country}>
                              <div 
                                className="not-italic font-medium text-base leading-6 tracking-[-0.02em] text-[#0C2143] truncate max-w-full overflow-hidden"
                                style={{ maxWidth: '150px' }}
                              >
                                {inv.state ? `${inv.state}, ${inv.country}` : inv.country}
                              </div>
                            </Tooltip>
                          </td>
                          <td className="w-[36%] lg:w-[39%] xl:w-[32%] 2xl:w-[24%] py-4 pr-1">
                            <div className="flex gap-[8px] lg:gap-[6px] xl:gap-[10px] items-center flex-wrap lg:flex-nowrap xl:flex-wrap">
                              <InvestorStatusDropdown 
                                status={inv.status}
                                shortlistId={inv.shortlistId}
                                onStatusChange={(newStatus) => {
                                  updateInvestorStatus(inv.shortlistId, newStatus);
                                }}
                                scrollContainerRef={tableScrollContainerRef}
                              />
                              {user && userData && !userDataLoading && inv.emails.length > 0 && (
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
                                  onEmailCreated={(emailId, isAI) => {
                                    selectEmail(emailId, isAI);
                                    triggerEmailRefresh();
                                  }}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          
          {/* Mails section */}
          <div className='bg-[#F4F6FB] px-4 h-[800px]'>
            <div className="bg-[#FFFFFF] border border-[#EDEEEF] rounded-[14px] h-full flex flex-col">
              <div className="p-5 flex-shrink-0">
                <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">Mails</h2>
              </div>
              
              <div className="flex-1 min-h-0">
                {user?.id ? (
                  <EmailTabsManager 
                    userId={user.id} 
                    refreshTrigger={emailRefreshTrigger} 
                    selectEmailId={selectedEmailId || undefined}
                    isAIEmail={isAIEmail}
                    onTabSwitch={(tab) => {
                      // Tab switched
                    }}
                    onEmailProcessed={() => {
                      // Clear the selectedEmailId after it's been processed to prevent re-triggering
                      setSelectedEmailId(null);
                      // Don't clear isAIEmail flag here - let it persist for future selections
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Please log in to view emails</p>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </main>
  );
}

