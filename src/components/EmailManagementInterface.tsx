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
}

export default function EmailManagementInterface({ userId, mode = 'draft', refreshTrigger, onEmailSent }: EmailManagementInterfaceProps) {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
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
        // Auto-select first email if none selected
        if (data.data.length > 0 && !selectedEmailId) {
          setSelectedEmailId(data.data[0].id);
        }
      } else if (Array.isArray(data)) {
        setDrafts(data);
        if (data.length > 0 && !selectedEmailId) {
          setSelectedEmailId(data[0].id);
        }
      } else {
        setDrafts([]);
      }
    } catch (err) {
      console.error(`Error fetching ${mode} emails:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${mode} emails`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [userId, mode, refreshTrigger]); // Add refreshTrigger to dependencies

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  const handleEmailUpdate = (updatedEmail: EmailDraft) => {
    setDrafts(prevDrafts => 
      prevDrafts.map(draft => 
        draft.id === updatedEmail.id ? updatedEmail : draft
      )
    );
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

  const selectedEmail = drafts.find(draft => draft.id === selectedEmailId) || null;

  if (loading) {
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
    <div className="flex h-full bg-gray-50">
      <EmailSidebar
        drafts={drafts}
        selectedEmailId={selectedEmailId}
        onEmailSelect={handleEmailSelect}
      />
      <EmailViewer
        email={selectedEmail}
        onEmailUpdate={handleEmailUpdate}
        onEmailSent={handleEmailSent}
        readOnly={mode === 'sent'}
      />
    </div>
  );
}
