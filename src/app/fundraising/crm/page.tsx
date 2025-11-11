'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useUserShortlist } from '@hooks/useUserShortlist'
import EmailTabsManager from '@components/EmailTabsManager'
import Loader from '@components/Loader'
import KanbanBoard from '@components/KanbanBoard'
import { fetchUserData } from '@lib/api'
import InvestorDetailsPage from '@components/InvestorDetailsPage'

export default function FundraisingPage() {
  const { user } = useUser();
  const {
    data,
    shortlist,
    loading,
    error,
  } = useUserShortlist(user?.id ?? ""); 

  
  // State for user data
  const [userData, setUserData] = useState<{
    companyName?: string;
    position?: string;
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

  // State for selected investor
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);

  // State for full-page loader
  const [showFullPageLoader, setShowFullPageLoader] = useState(true);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);


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

  // Function to update investor status by investor ID
  const updateInvestorStatusByInvestorId = (investorId: string, newStatus: string) => {
    setShortlistState(prev => 
      prev.map(inv => 
        inv.id === investorId 
          ? { ...inv, status: newStatus }
          : inv
      )
    );
  };

  // Function to handle investor selection
  const handleInvestorClick = (investorId: string) => {
    console.log('Investor clicked:', investorId);
    // Set the investor ID - the InvestorDetailsPage component will handle fetching the data
    setSelectedInvestor({ id: investorId });
  };

  // Function to go back to investor list
  const handleBackToList = () => {
    setSelectedInvestor(null);
  };

  // Function to download CSV
  const downloadCSV = () => {
    if (!shortlistState || shortlistState.length === 0) {
      alert('No data to export');
      return;
    }

    // CSV headers
    const headers = ['Name', 'Company Name', 'Email', 'Location', 'Phone Number'];
    
    // CSV data rows
    const csvData = shortlistState.map(inv => [
      inv.name || '',
      inv.companyName || 'N/A',
      inv.emails?.[0]?.email || 'N/A',
      inv.state ? `${inv.state}, ${inv.country}` : inv.country || 'N/A',
      inv.phone || 'N/A' // Add phone number if available in the data
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `investors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex bg-[#FFFFFF] items-center bg-[rgba(255, 255, 255, 0.8)] h-[60px] px-5 py-4 border-b border-[#EDEEEF] justify-between">
            <div className="flex items-center">
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

            {/* Download CSV Button */}
            <button onClick={downloadCSV}
              className="w-auto justify-center items-center px-5 py-2.5 gap-1 h-[auto] bg-[#2563EB] rounded-[10px] font-manrope not-italic font-medium text-[14px] leading-[19px] tracking-[-0.02em] text-[#FFFFFF] cursor-pointer flex"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download CSV
                      </button>
          </div>

          {/* Kanban Board Layout */}
          <div className="bg-[#F4F6FB]">
            <div className="bg-[#F4F6FB]">
              {/* Header */}
              {selectedInvestor && (
                <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-[#EDEEEF]">
                  <button
                    onClick={handleBackToList}
                    className="text-sm text-slate-600 hover:underline flex items-center gap-2"
                  >
                    ← Back to my list
                  </button>
                </div>
              )}

              {/* Kanban Board Content */}
              <div className="min-h-[500px]">
                {selectedInvestor ? (
                  // Individual investor view - render the actual investor page component
                  <InvestorDetailsPage 
                    investorId={selectedInvestor.id}
                  />
                ) : (
                  // Kanban board view
                  <>
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
                      <KanbanBoard
                        investors={shortlistState}
                        onStatusChange={updateInvestorStatus}
                        onInvestorClick={handleInvestorClick}
                                  user={user}
                                  userData={userData}
                        userDataLoading={userDataLoading}
                        onEmailGenerated={(message) => {
                                    setEmailGenerationStatus({
                                      type: 'success',
                            message: message
                                    });
                                    setTimeout(() => {
                                      setEmailGenerationStatus({ type: null, message: '' });
                                    }, 3000);
                                  }}
                                  onError={(error) => {
                                    setEmailGenerationStatus({
                                      type: 'error',
                                      message: error
                                    });
                                    setTimeout(() => {
                                      setEmailGenerationStatus({ type: null, message: '' });
                                    }, 5000);
                                  }}
                        onEmailCreated={(emailId, isAI, investorId) => {
                                    selectEmail(emailId, isAI);
                                    triggerEmailRefresh();
                                    setShortlistState(prev =>
                                      prev.map(item =>
                              item.id === investorId ? { ...item, hasDraft: true } : item
                                      )
                                    );
                                  }}
                        onEmailSent={(investorId) => {
                          setShortlistState(prev =>
                            prev.map(item =>
                              item.id === investorId ? { ...item, hasDraft: false } : item
                            )
                          );
                          updateInvestorStatusByInvestorId(investorId, 'CONTACTED');
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mails section */}
          <div className='bg-[#F4F6FB] px-4 h-[800px]'>
            <div className="bg-[#FFFFFF] border border-[#EDEEEF] rounded-[14px] h-full flex flex-col relative overflow-hidden">
              {isAttachmentUploading && (
                <div className="absolute inset-0 bg-white/80 z-30 flex flex-col items-center justify-center">
                  <Loader
                    size="lg"
                    text="Uploading attachments..."
                    textColor="text-[#0C2143]"
                    spinnerColor="border-[#2563EB]"
                    className="py-4"
                  />
                </div>
              )}
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
                    onEmailSent={(investorId) => {
                      if (!investorId) {
                        return;
                      }
                      setShortlistState(prev =>
                        prev.map(item =>
                          item.id === investorId ? { ...item, hasDraft: false } : item
                        )
                      );
                      // Update the shortlist status to CONTACTED when email is sent successfully
                      updateInvestorStatusByInvestorId(investorId, 'CONTACTED');
                    }}
                    onAttachmentUploadStatusChange={(status) => setIsAttachmentUploading(status)}
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
