'use client';

import { useState, useEffect } from 'react';
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
}

export default function EmailManagementInterface({ userId, mode = 'draft', refreshTrigger, onEmailSent, onSaveStart, onSaveEnd }: EmailManagementInterfaceProps) {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDraft | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [needsFreshData, setNeedsFreshData] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  const fetchDrafts = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    // Only show tab switching overlay if we have existing data and are switching modes
    if (drafts.length > 0 && hasInitialData) {
      setIsTabSwitching(true);
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
        // Auto-select first email if none selected
        if (data.data.length > 0 && !selectedEmailId) {
          setSelectedEmailId(data.data[0].id);
        }
      } else if (Array.isArray(data)) {
        setDrafts(data);
        setHasInitialData(true);
        if (data.length > 0 && !selectedEmailId) {
          setSelectedEmailId(data[0].id);
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
    }
  };

  const fetchIndividualEmail = async (emailId: string) => {
    if (!emailId) return;
    
    // First, try to find the email in the current drafts list to avoid unnecessary loading
    const existingEmail = drafts.find(draft => draft.id === emailId);
    if (existingEmail) {
      setSelectedEmail(existingEmail);
    }
    
    setLoadingEmail(true);
    
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
      setLoadingEmail(false);
    }
  };

  useEffect(() => {
    // Set needsFreshData to true when refreshing data
    if (refreshTrigger && refreshTrigger > 0) {
      setNeedsFreshData(true);
    }
    fetchDrafts();
  }, [userId, mode, refreshTrigger]); // Add refreshTrigger to dependencies

  // Fetch individual email when selectedEmailId changes
  useEffect(() => {
    if (selectedEmailId) {
      // For both sent and draft emails, show cached data immediately
      const emailFromList = drafts.find(draft => draft.id === selectedEmailId);
      if (emailFromList) {
        setSelectedEmail(emailFromList);
      }
      
      // Only fetch individual email for draft emails if we don't have the email in our list
      // OR if we specifically need fresh data (like after a save operation)
      if (mode === 'draft' && (!emailFromList || needsFreshData)) {
        // Add a small delay to ensure any pending saves have completed
        const timeoutId = setTimeout(() => {
          fetchIndividualEmail(selectedEmailId);
          setNeedsFreshData(false); // Reset the flag after fetching
        }, 500); // 500ms delay to allow pending saves to complete
        
        return () => clearTimeout(timeoutId);
      }
    } else {
      setSelectedEmail(null);
    }
  }, [selectedEmailId, mode, drafts, needsFreshData]); // Add needsFreshData dependency

  // Cleanup effect to handle pending saves
  useEffect(() => {
    return () => {
      // If there's a pending save when component unmounts, we can't do much
      // but we can log it for debugging
      if (pendingSave) {
        console.warn('Component unmounted with pending save - changes may be lost');
      }
    };
  }, [pendingSave]);

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
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

  const handleEmailSaveStart = () => {
    setPendingSave(true);
    if (onSaveStart) {
      onSaveStart();
    }
  };

  const handleEmailSaveEnd = () => {
    setPendingSave(false);
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
          <p className="text-gray-600">Loading email drafts...</p>
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
      {/* Background loading indicator */}
      {loading && (
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
            <p className="text-gray-600 text-sm">Loading {mode === 'sent' ? 'sent' : 'draft'} emails...</p>
          </div>
        </div>
      )}
      
      <EmailSidebar
        drafts={drafts}
        selectedEmailId={selectedEmailId}
        onEmailSelect={handleEmailSelect}
      />
      <EmailViewer
        email={selectedEmail}
        onEmailUpdate={handleEmailUpdate}
        onEmailSent={handleEmailSent}
        onEmailSaveStart={mode === 'draft' ? handleEmailSaveStart : undefined}
        onEmailSaveEnd={mode === 'draft' ? handleEmailSaveEnd : undefined}
        readOnly={mode === 'sent'}
        loading={mode === 'draft' ? loadingEmail : false}
      />
    </div>
  );
}
