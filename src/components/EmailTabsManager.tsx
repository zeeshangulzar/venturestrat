'use client';

import { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '@lib/api';
import MailTabs, { MailSectionType } from './MailTabs';
import EmailManagementInterface from './EmailManagementInterface';

interface EmailTabsManagerProps {
  userId: string;
  refreshTrigger?: number; // Add refresh trigger prop
  selectEmailId?: string; // Add prop to select a specific email ID
  isAIEmail?: boolean; // Add flag to indicate if this is an AI email
  onTabSwitch?: (tab: MailSectionType) => void; // Add callback for tab switching
  onEmailProcessed?: () => void; // Add callback for when email is processed
  onEmailSent?: (investorId?: string) => Promise<void> | void; // Add callback when an email is sent
  onAttachmentUploadStatusChange?: (isUploading: boolean) => void; // Notify parent when attachments upload
}

interface EmailCounts {
  all: number;
  sent: number;
  opened: number;
  answered: number;
  scheduled: number;
}

export default function EmailTabsManager({ userId, refreshTrigger, selectEmailId, isAIEmail, onTabSwitch, onEmailProcessed, onEmailSent, onAttachmentUploadStatusChange }: EmailTabsManagerProps) {
  const [activeSection, setActiveSection] = useState<MailSectionType>('all');
  const [counts, setCounts] = useState<EmailCounts>({
    all: 0,
    sent: 0,
    opened: 0,
    answered: 0,
    scheduled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pendingSave, setPendingSave] = useState(false);
  const [userInitiatedTabChange, setUserInitiatedTabChange] = useState(false);
  const [processedSelectEmailId, setProcessedSelectEmailId] = useState<string | null>(null);
  
  // Ref to store the save function from EmailManagementInterface
  const saveRef = useRef<(() => Promise<void>) | null>(null);

  const fetchCounts = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Fetch draft emails count
      const draftResponse = await fetch(getApiUrl(`/api/messages/draft/${userId}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      // Fetch sent emails count
      const sentResponse = await fetch(getApiUrl(`/api/messages/sent/${userId}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const answeredResponse = await fetch(getApiUrl(`/api/messages/answered/${userId}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const scheduledResponse = await fetch(getApiUrl(`/api/messages/scheduled/${userId}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      let draftCount = 0;
      let sentCount = 0;
      let answeredCount = 0;
      let scheduledCount = 0;

      if (draftResponse.ok) {
        const draftData = await draftResponse.json();
        draftCount = draftData.data?.length || draftData.count || 0;
      }

      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        sentCount = sentData.data?.length || sentData.count || 0;
      }
      if (answeredResponse.ok) {
        const answeredData = await answeredResponse.json();
        answeredCount = answeredData.data?.length || answeredData.count || 0;
      }
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        scheduledCount = scheduledData.data?.length || scheduledData.count || 0;
      }

      setCounts({
        all: draftCount,
        sent: sentCount,
        opened: 0, // Placeholder for future implementation
        answered: answeredCount,
        scheduled: scheduledCount,
      });
    } catch (error) {
      console.error('Error fetching email counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [userId, refreshTrigger]); // Add refreshTrigger to dependencies

  // Reset user-initiated flag when selectEmailId changes (new AI email created)
  useEffect(() => {
    if (selectEmailId) {
      setUserInitiatedTabChange(false);
      setProcessedSelectEmailId(null); // Reset processed state for new selectEmailId
      // Force refresh of email list to ensure we get the latest data
      // This handles the case where backend returns existing email instead of new one
      fetchCounts();
    }
  }, [selectEmailId]);

  // Auto-switch to 'all' tab when selectEmailId is provided (AI email created)
  // But only if the user hasn't manually switched tabs
  useEffect(() => {
    if (selectEmailId && activeSection !== 'all' && !userInitiatedTabChange) {
      setActiveSection('all');
      if (onTabSwitch) {
        onTabSwitch('all');
      }
    }
  }, [selectEmailId, activeSection, onTabSwitch, userInitiatedTabChange]);

  const handleSectionChange = async (section: MailSectionType) => {
    // Mark this as a user-initiated tab change
    setUserInitiatedTabChange(true);
    
    // If switching away from 'all' tab (drafts), force save before switching
    if (activeSection === 'all' && section !== 'all') {
      console.log('Switching away from drafts tab - forcing immediate save...');
      
      try {
        // Force immediate save if save function is available
        if (saveRef.current) {
          console.log('Triggering immediate save before tab switch...');
          await saveRef.current();
          console.log('Immediate save completed before tab switch');
        } else {
          console.log('No save function available, proceeding with tab switch');
        }
      } catch (error) {
        console.error('Error saving before tab switch:', error);
        // Continue with tab switch even if save fails
      }
    }
    
    // Add a small delay to prevent viewport jumping
    setTimeout(() => {
      setActiveSection(section);
      // Refresh counts when switching sections
      fetchCounts();
    }, 50);
  };

  const handleEmailSent = async (investorId?: string) => {
    // Refresh counts when an email is sent
    await fetchCounts();
    
    if (onEmailSent) {
      await onEmailSent(investorId);
    }
  };

  const handleSaveStart = () => {
    setPendingSave(true);
  };

  const handleSaveEnd = () => {
    setPendingSave(false);
  };

  const handleSelectEmailProcessed = () => {
    setProcessedSelectEmailId(selectEmailId || null);
    // Notify parent component to clear the selectEmailId immediately
    if (onEmailProcessed && selectEmailId) {
      onEmailProcessed();
    }
    // Clear the processed state after a short delay to allow for future selections
    setTimeout(() => {
      setProcessedSelectEmailId(null);
    }, 1000);
  };

  const handleSaveRefReady = (ref: React.MutableRefObject<(() => Promise<void>) | null>) => {
    saveRef.current = ref.current;
  };


  const willPassSelectEmailId = selectEmailId && processedSelectEmailId !== selectEmailId ? selectEmailId : undefined;

  return (
    <MailTabs
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      counts={counts}
      disabled={false}
    >
      <div className="h-full">
        {activeSection === 'all' && (
          <EmailManagementInterface 
            userId={userId} 
            mode="draft" 
            refreshTrigger={refreshTrigger} 
            onEmailSent={handleEmailSent}
            onSaveStart={handleSaveStart}
            onSaveEnd={handleSaveEnd}
            selectEmailId={willPassSelectEmailId}
            isAIEmail={isAIEmail}
            onSelectEmailProcessed={handleSelectEmailProcessed}
            onSaveRefReady={handleSaveRefReady}
            onAttachmentUploadStatusChange={onAttachmentUploadStatusChange}
            onRequestTabChange={(section) => { handleSectionChange(section); }}
          />
        )}
        
        {activeSection === 'sent' && (
          <EmailManagementInterface 
            userId={userId} 
            mode="sent" 
            refreshTrigger={refreshTrigger} 
            onEmailSent={handleEmailSent}
            onSaveStart={handleSaveStart}
            onSaveEnd={handleSaveEnd}
            selectEmailId={undefined}
            onSelectEmailProcessed={handleSelectEmailProcessed}
            onSaveRefReady={handleSaveRefReady}
            onAttachmentUploadStatusChange={onAttachmentUploadStatusChange}
            onRequestTabChange={(section) => { handleSectionChange(section); }}
          />
        )}
        
        {activeSection === 'opened' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-yellow-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Opened Emails</h3>
              <p className="text-gray-500">This section will show emails that have been opened by recipients.</p>
            </div>
          </div>
        )}
        
        {activeSection === 'answered' && (
          <EmailManagementInterface 
            userId={userId} 
            mode="answered" 
            refreshTrigger={refreshTrigger} 
            onEmailSent={handleEmailSent}
            onSaveStart={handleSaveStart}
            onSaveEnd={handleSaveEnd}
            selectEmailId={undefined}
            onSelectEmailProcessed={handleSelectEmailProcessed}
            onSaveRefReady={handleSaveRefReady}
            onAttachmentUploadStatusChange={onAttachmentUploadStatusChange}
            onRequestTabChange={(section) => { handleSectionChange(section); }}
          />
        )}
        
        {activeSection === 'scheduled' && (
          <EmailManagementInterface 
            userId={userId} 
            mode="scheduled" 
            refreshTrigger={refreshTrigger} 
            onEmailSent={handleEmailSent}
            onSaveStart={handleSaveStart}
            onSaveEnd={handleSaveEnd}
            selectEmailId={undefined}
            onSelectEmailProcessed={handleSelectEmailProcessed}
            onSaveRefReady={handleSaveRefReady}
            onRequestTabChange={(section) => { handleSectionChange(section); }}
          />
        )}
      </div>
    </MailTabs>
  );
}
