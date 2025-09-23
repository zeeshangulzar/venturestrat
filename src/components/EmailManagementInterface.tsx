'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '@lib/api';
import EmailSidebar from './EmailSidebar';
import EmailViewer from './EmailViewer';

interface EmailDraft {
  id: string;
  to: string | string[];
  from: string;
  subject?: string;
  body: string;
  createdAt: string;
  investorId: string;
  investorName?: string;
  status?: string;
}

interface EmailManagementInterfaceProps {
  userId: string;
  mode?: 'draft' | 'sent';
  refreshTrigger?: number; // Add refresh trigger prop
  onEmailSent?: () => void; // Add callback for when email is sent
  onSaveStart?: () => void; // Add callback for when save starts
  onSaveEnd?: () => void; // Add callback for when save ends
  selectEmailId?: string; // Add prop to select a specific email ID
  isAIEmail?: boolean; // Add flag to indicate if this is an AI email
  onSelectEmailProcessed?: () => void; // Add callback for when selectEmailId is processed
  onSaveRefReady?: (saveRef: React.MutableRefObject<(() => Promise<void>) | null>) => void; // Add callback for save ref
}

export default function EmailManagementInterface({ userId, mode = 'draft', refreshTrigger, onEmailSent, onSaveStart, onSaveEnd, selectEmailId, isAIEmail, onSelectEmailProcessed, onSaveRefReady }: EmailManagementInterfaceProps) {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDraft | null>(null);
  const [pendingSave, setPendingSave] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [needsFreshData, setNeedsFreshData] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingIndividualEmail, setIsFetchingIndividualEmail] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastFetchRef = useRef<string | null>(null);
  const lastIndividualFetchRef = useRef<string | null>(null);
  const processedSelectEmailIdRef = useRef<string | null>(null);
  const previousSelectedEmailIdRef = useRef<string | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create save ref to expose save functionality
  const saveRef = useRef<(() => Promise<void>) | null>(null);
  
  // Notify parent when save ref is ready
  useEffect(() => {
    if (onSaveRefReady) {
      onSaveRefReady(saveRef);
    }
  }, [onSaveRefReady]);

  // Force refresh individual email data (for draft switching)
  const forceRefreshIndividualEmail = useCallback(async (emailId: string) => {
    if (!emailId) return;
    
    console.log(`Force refreshing individual email data for ID: ${emailId}`);
    
    // Clear any existing fetch to allow fresh fetch
    lastIndividualFetchRef.current = null;
    
    // Set loading state but don't clear current selection to avoid empty state
    setIsFetchingIndividualEmail(true);
    
    await fetchIndividualEmail(emailId);
  }, []);

  const fetchDrafts = async () => {
    if (!userId) return;
    
    // Create a unique key for this fetch request
    const fetchKey = `${mode}-${userId}-${refreshTrigger}`;
    
    // Prevent duplicate calls with the same parameters
    if (lastFetchRef.current === fetchKey) {
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (isFetching) {
      return;
    }
    
    // Mark this fetch as in progress
    lastFetchRef.current = fetchKey;
    
    setIsFetching(true);
    setLoading(true);
    setError(null);
    
    // Only show tab switching overlay if we have existing data and are switching modes
    // Add a small delay to prevent flickering during rapid tab switches
    if (drafts.length > 0 && hasInitialData) {
      setTimeout(() => {
        setIsTabSwitching(true);
      }, 100);
    }
    
    // For both sent and draft emails, fetch immediately
    // The individual email fetch will only happen if needed
    await performFetch();
  };

  const performFetch = async () => {
    try {
      const endpoint = mode === 'sent' 
        ? `/api/messages/sent/${userId}` 
        : `/api/messages/draft/${userId}`;
        
      const response = await fetch(getApiUrl(endpoint), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${mode} emails: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the backend response structure: { message, count, data: Array }
      if (data.data && Array.isArray(data.data)) {
        setDrafts(data.data);
        setHasInitialData(true);
        // Auto-select first email if none selected, or if we have a specific email to select
        if (data.data.length > 0) {
          if (!selectedEmailId) {
            setSelectedEmailId(data.data[0].id);
          } else if (selectEmailId && selectedEmailId !== selectEmailId) {
            // If we have a selectEmailId and it's different from current selection, select it
            // This handles both cases: when the email exists in the list and when it doesn't (AI-generated email)
            setSelectedEmailId(selectEmailId);
            // Notify parent that selectEmailId has been processed
            if (onSelectEmailProcessed) {
              onSelectEmailProcessed();
            }
          }
        }
      } else if (Array.isArray(data)) {
        setDrafts(data);
        setHasInitialData(true);
        if (data.length > 0) {
          if (!selectedEmailId) {
            setSelectedEmailId(data[0].id);
          } else if (selectEmailId && selectedEmailId !== selectEmailId && processedSelectEmailIdRef.current !== selectEmailId) {
            // If we have a selectEmailId and it's different from current selection, select it
            // This handles both cases: when the email exists in the list and when it doesn't (AI-generated email)
            // For AI emails, we always want to fetch fresh data from backend, even if email exists in list
            // Only process if we haven't already processed this selectEmailId
            setSelectedEmailId(selectEmailId);
            processedSelectEmailIdRef.current = selectEmailId; // Mark as processed
            
            // For AI emails, immediately fetch fresh data from backend
            if (mode === 'draft') {
              setIsFetchingIndividualEmail(true);
              setSelectedEmail(null);
              fetchIndividualEmail(selectEmailId, true); // AI email, bypass duplicate check
            }
            
            // Notify parent that selectEmailId has been processed
            if (onSelectEmailProcessed) {
              onSelectEmailProcessed();
            }
          }
        }
      } else {
        setDrafts([]);
        setHasInitialData(true);
      }
    } catch (err) {
      console.error(`Error fetching ${mode} emails:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${mode} emails`);
    } finally {
      setLoading(false);
      setIsTabSwitching(false);
      setIsFetching(false);
      // Clear the fetch key after completion to allow future fetches
      lastFetchRef.current = null;
    }
  };

  const fetchIndividualEmail = async (emailId: string, isAIEmail = false) => {
    if (!emailId) return;
    
    // Prevent duplicate calls for the same email ID, but not for AI emails
    if (!isAIEmail && lastIndividualFetchRef.current === emailId) {
      return;
    }
    
    // Mark this fetch as in progress
    lastIndividualFetchRef.current = emailId;
    
    // Always set loading state when fetching individual email
    setIsFetchingIndividualEmail(true);
    
    // Find existing email for fallback, but don't set it immediately
    const existingEmail = drafts.find(draft => draft.id === emailId);
    
    try {
      const response = await fetch(getApiUrl(`/api/message/${emailId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch email: ${response.status}`);
      }

      const data = await response.json();
      // Handle the response format where data is wrapped in a 'message' object
      const emailData = data.message || data;
      setSelectedEmail(emailData);
    } catch (err) {
      console.error('Error fetching individual email:', err);
      // Fallback to existing email if available
      if (existingEmail) {
        setSelectedEmail(existingEmail);
      } else {
        setSelectedEmail(null);
      }
    } finally {
      // Clear the fetch reference after completion
      lastIndividualFetchRef.current = null;
      setIsFetchingIndividualEmail(false);
      
      // End transition after a short delay to ensure smooth UI (only for non-AI emails)
      if (!isAIEmail) {
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 100); // Small delay to prevent flashing
      } else {
        // AI emails should update immediately without transition delay
        setIsTransitioning(false);
      }
    }
  };

  useEffect(() => {
    // Set needsFreshData to true when refreshing data
    if (refreshTrigger && refreshTrigger > 0) {
      setNeedsFreshData(true);
    }
    fetchDrafts();
  }, [userId, mode, refreshTrigger]); // Add refreshTrigger to dependencies

  // Handle selectEmailId prop - reset processed ref when new selectEmailId is provided
  useEffect(() => {
    if (selectEmailId && processedSelectEmailIdRef.current !== selectEmailId) {
      processedSelectEmailIdRef.current = null; // Reset to allow processing of new selectEmailId
    }
  }, [selectEmailId]);

  // Fetch individual email when selectedEmailId changes (only when switching to a different email)
  useEffect(() => {
    // Only proceed if selectedEmailId has actually changed to a different value
    if (selectedEmailId !== previousSelectedEmailIdRef.current) {
      previousSelectedEmailIdRef.current = selectedEmailId;
      
      // Clear any existing transition timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      if (selectedEmailId) {
        // When selectEmailId is provided (AI email creation), always fetch fresh data from backend
        if (selectEmailId && selectedEmailId && selectedEmailId.startsWith(selectEmailId)) {
          // AI emails don't need transition blocking - they should update immediately
          // Extract the actual email ID (remove timestamp suffix if present)
          const actualEmailId = selectedEmailId.split('_')[0];
          
          // Always fetch fresh data from backend for emails selected via selectEmailId
          setSelectedEmail(null);
          fetchIndividualEmail(actualEmailId, isAIEmail); // Pass AI email flag
          
          // Notify parent that selectEmailId has been processed
          if (onSelectEmailProcessed) {
            onSelectEmailProcessed();
          }
          return;
        }

        // For sent emails, just show cached data immediately
        if (mode === 'sent') {
          const emailFromList = drafts.find(draft => draft.id === selectedEmailId);
          if (emailFromList) {
            setSelectedEmail(emailFromList);
          }
        } else {
          // For regular draft emails (not AI), apply transition to prevent flashing
          if (!isAIEmail) {
            setIsTransitioning(true);
          }
          
          // For draft emails, always fetch fresh data from backend when switching
          // This ensures we always get the latest data from the database (including AI emails)
          setIsFetchingIndividualEmail(true);
          // Clear selectedEmail to show loading state instead of "Select an email"
          setSelectedEmail(null);
          
          // Extract actual email ID if it has timestamp suffix (for AI emails)
          const actualEmailId = selectedEmailId.includes('_') ? selectedEmailId.split('_')[0] : selectedEmailId;
          fetchIndividualEmail(actualEmailId, isAIEmail || false); // Use AI email flag if provided
        }
      } else {
        setSelectedEmail(null);
      }
    }
  }, [selectedEmailId, mode, selectEmailId, isAIEmail, onSelectEmailProcessed]);


  // Cleanup effect to handle pending saves
  useEffect(() => {
    return () => {
      // If there's a pending save when component unmounts, we can't do much
      // but we can log it for debugging
      if (pendingSave) {
        console.warn('Component unmounted with pending save - changes may be lost');
      }
      // Clear transition timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [pendingSave]);

  const handleEmailSelect = async (emailId: string) => {
    // Prevent rapid switching during transition, but allow AI emails to bypass this
    if (isTransitioning && !isAIEmail) {
      return;
    }
    
    // If we're in draft mode and switching to a different email, wait for save and fetch fresh data
    if (mode === 'draft' && selectedEmailId && selectedEmailId !== emailId) {
      
      // Wait for any pending save to complete (max 3 seconds)
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds with 100ms intervals
      
      while (isSaving && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (isSaving) {
        setIsSaving(false);
      }
      
      // Now fetch fresh data for the new email
      setSelectedEmailId(emailId);
      await forceRefreshIndividualEmail(emailId);
    } else {
      // For other cases, just set the email ID normally
      setSelectedEmailId(emailId);
    }
  };

  const handleEmailUpdate = (updatedEmail: EmailDraft) => {
    setDrafts(prevDrafts => 
      prevDrafts.map(draft => 
        draft.id === updatedEmail.id ? updatedEmail : draft
      )
    );
    // Also update the selected email if it's the same one
    if (selectedEmailId === updatedEmail.id) {
      setSelectedEmail(updatedEmail);
    }
    // Clear pending save status when update is complete
    setPendingSave(false);
    
    // After updating, we have fresh data, so no need to fetch individual email
    // The updated email is already in our drafts list and selectedEmail
    // Set needsFreshData to false since we just got fresh data
    setNeedsFreshData(false);
  };

  // Function to refresh individual email data when needed
  const refreshSelectedEmail = () => {
    if (selectedEmailId && mode === 'draft') {
      fetchIndividualEmail(selectedEmailId);
    }
  };

  // Function to refresh email data from backend after auto-save
  const refreshEmailFromBackend = async () => {
    if (!selectedEmailId || mode !== 'draft') return;
    
    try {
      const response = await fetch(getApiUrl(`/api/message/${selectedEmailId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch updated email: ${response.status}`);
      }

      const data = await response.json();
      const emailData = data.message || data;
      
      // Update the drafts array with fresh data from backend
      setDrafts(prevDrafts => 
        prevDrafts.map(draft => 
          draft.id === emailData.id ? emailData : draft
        )
      );
      
      // Update selected email if it's the same one
      if (selectedEmailId === emailData.id) {
        setSelectedEmail(emailData);
      }
    } catch (error) {
      console.error('Error refreshing email from backend:', error);
    }
  };

  const handleEmailSaveStart = () => {
    setPendingSave(true);
    setIsSaving(true);
    if (onSaveStart) {
      onSaveStart();
    }
  };

  const handleEmailSaveEnd = () => {
    setPendingSave(false);
    setIsSaving(false);
    if (onSaveEnd) {
      onSaveEnd();
    }
  };

  const handleEmailSent = () => {
    // Refresh the draft list to remove the sent email
    fetchDrafts();
    
    // Clear selected email since it's no longer a draft
    setSelectedEmailId(null);
    
    // Notify parent component if callback provided
    if (onEmailSent) {
      onEmailSent();
    }
  };

  // Only show full-page loader on initial load when we have no data at all
  if (loading && !hasInitialData && drafts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-2">Error loading emails</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDrafts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 relative">
      {/* Background loading indicator - only show when not tab switching */}
      {loading && !isTabSwitching && !hasInitialData && (
        <div className="absolute top-2 right-2 z-20">
          <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">
                {hasInitialData ? 'Refreshing...' : 'Loading...'}
              </span>
          </div>
        </div>
      )}
      
      {/* Loading overlay for tab switching - reduced opacity for smoother transition */}
      {isTabSwitching && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 transition-opacity duration-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading {mode === "sent" ? "sent" : "draft"} emails...</p>
          </div>
        </div>
      )}
      
      <EmailSidebar
        drafts={drafts}
        selectedEmailId={selectedEmailId ? selectedEmailId.split('_')[0] : selectedEmailId}
        onEmailSelect={handleEmailSelect}
      />
      <EmailViewer
        email={selectedEmail}
        onEmailUpdate={handleEmailUpdate}
        onEmailSent={handleEmailSent}
        onEmailSaveStart={mode === 'draft' ? handleEmailSaveStart : undefined}
        onEmailSaveEnd={mode === 'draft' ? handleEmailSaveEnd : undefined}
        onEmailRefresh={mode === 'draft' ? refreshEmailFromBackend : undefined}
        readOnly={mode === 'sent'}
        loading={isFetchingIndividualEmail || isTransitioning}
        saveRef={saveRef}
      />
    </div>
  );
}
