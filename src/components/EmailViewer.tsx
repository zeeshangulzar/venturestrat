'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '@lib/api';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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

interface EmailViewerProps {
  email: EmailDraft | null;
  onEmailUpdate: (updatedEmail: EmailDraft) => void;
  onEmailSent?: () => void;
  onEmailSaveStart?: () => void;
  onEmailSaveEnd?: () => void;
  readOnly?: boolean;
  loading?: boolean;
}

export default function EmailViewer({ email, onEmailUpdate, onEmailSent, onEmailSaveStart, onEmailSaveEnd, readOnly = false, loading = false }: EmailViewerProps) {
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [editedFrom, setEditedFrom] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendMessage, setSendMessage] = useState('');
  
  // Debounced auto-save functionality (same pattern as settings page)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to store current values for auto-save (to avoid dependency issues)
  const currentValuesRef = useRef({
    editedSubject: '',
    editedBody: '',
    editedFrom: ''
  });
  
  // Ref to store previous body length for deletion detection
  const previousBodyLengthRef = useRef(0);
  
  // Ref to track if we're setting initial data (to prevent auto-save)
  const isSettingInitialDataRef = useRef(false);
  
  // Ref for CKEditor instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (email) {
      const subject = email.subject || '';
      // Handle both HTML and plain text body content
      const body = email.body || '';
      const from = email.from || '';
      
      setEditedSubject(subject);
      setEditedBody(body);
      setEditedFrom(from);
      setSaveStatus('idle');
      
      // Update ref values
      currentValuesRef.current = {
        editedSubject: subject,
        editedBody: body,
        editedFrom: from
      };
      
      // Initialize previous body length
      previousBodyLengthRef.current = body.length;
      
      // Set flag to prevent auto-save when setting initial data
      isSettingInitialDataRef.current = true;
      
      // Update editor content if editor is ready
      if (editorRef.current) {
        editorRef.current.setData(body);
      }
      
      // Reset flag after a short delay to allow editor to process the data
      setTimeout(() => {
        isSettingInitialDataRef.current = false;
      }, 100);
    }
  }, [email]);

  // Cleanup timeout on unmount (same pattern as settings page)
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Define autoSave function first (same pattern as settings page)
  const autoSave = useCallback(async () => {
    if (!email || readOnly) return;

    setIsSaving(true);
    setSaveStatus('idle');
    
    // Notify parent component that save is starting
    if (onEmailSaveStart) {
      onEmailSaveStart();
    }

    try {
      const currentValues = currentValuesRef.current;

      const response = await fetch(getApiUrl(`/api/message/${email.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: currentValues.editedSubject,
          body: currentValues.editedBody, // This will be HTML from CKEditor
          from: currentValues.editedFrom,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update email');
      }

      const updatedEmail = await response.json();
      onEmailUpdate(updatedEmail);
      setSaveStatus('success');
      
      // Clear success status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      
      // Clear error status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
      
      // Notify parent component that save is complete
      if (onEmailSaveEnd) {
        onEmailSaveEnd();
      }
    }
  }, [email, readOnly, onEmailUpdate, onEmailSaveStart, onEmailSaveEnd]);
  
  const debouncedAutoSave = useCallback(() => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for 1.5 seconds after user stops typing (reduced for better responsiveness)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);
  }, [autoSave]);

  // Handle field changes with auto-save
  const handleFieldChange = (field: string, value: string) => {
    console.log('Field change debug:', { field, value });
    
    // Skip auto-save if we're setting initial data
    if (isSettingInitialDataRef.current) {
      console.log('Skipping auto-save - setting initial data');
      return;
    }
    
    switch (field) {
      case 'subject':
        setEditedSubject(value);
        currentValuesRef.current.editedSubject = value;
        break;
      case 'body':
        setEditedBody(value);
        currentValuesRef.current.editedBody = value;
        
        // Check if this is a significant deletion (content length decreased by more than 50%)
        const previousLength = previousBodyLengthRef.current;
        if (previousLength > 0 && value.length < previousLength * 0.5) {
          // This looks like a significant deletion, save immediately
          console.log('Significant deletion detected, saving immediately');
          autoSave();
          return;
        }
        // Update previous length for next comparison
        previousBodyLengthRef.current = value.length;
        break;
      case 'from':
        setEditedFrom(value);
        currentValuesRef.current.editedFrom = value;
        break;
    }
    // Use debounced auto-save (same pattern as settings page)
    debouncedAutoSave();
  };

  const handleSendEmail = async () => {
    if (!email?.id) return;
    
    setIsSending(true);
    setSendStatus('idle');
    setSendMessage('');
    
    try {
      const response = await fetch(getApiUrl(`/api/message/${email.id}/send`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = result.message || result.error || `Failed to send email: ${response.statusText}`;
        setSendStatus('error');
        setSendMessage(errorMessage);
        console.error('Error sending email:', errorMessage);
        return;
      }

      console.log('Email sent successfully:', result);
      setSendStatus('success');
      setSendMessage(result.message || 'Email sent successfully!');
      
      // Notify parent component that email was sent (to refresh draft list)
      if (onEmailSent) {
        onEmailSent();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSendStatus('idle');
        setSendMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error sending email:', error);
      setSendStatus('error');
      setSendMessage(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };



  const getRecipients = (to: string | string[]) => {
    if (Array.isArray(to)) {
      return to.join(', ');
    }
    return to;
  };


  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an email</h3>
          <p className="text-gray-500">Choose an email from the sidebar to view and edit its content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {readOnly ? (
              <h1 className="text-lg font-semibold text-gray-900">
                {email.subject || 'No Subject'}
              </h1>
            ) : (
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                className="w-full text-lg font-semibold border border-gray-300 rounded px-3 py-2 focus:outline-none"
                placeholder="Email subject"
              />
            )}
          </div>
        </div>

        {/* Email Metadata */}
        <div className="space-y-4 text-sm">
          {/* From Field - First */}
          <div>
            <span className="font-medium text-gray-700">From:</span>
            {readOnly ? (
              <span className="ml-2 text-gray-900">{email.from}</span>
            ) : (
              <input
                type="email"
                value={editedFrom}
                onChange={(e) => handleFieldChange('from', e.target.value)}
                className="ml-2 border border-gray-300 rounded px-2 py-1 focus:outline-none"
                placeholder="sender@example.com"
              />
            )}
          </div>
          
          {/* To Field - Display Only */}
          <div>
            <span className="font-medium text-gray-700">To:</span>
            <span className="ml-2 text-gray-900">{getRecipients(email.to)}</span>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 flex flex-col min-h-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Content
          </label>
          {readOnly ? (
            <div className="w-full h-full min-h-[400px] border border-gray-200 rounded-md px-3 py-2 bg-gray-50 overflow-y-auto">
              <div 
                className="text-gray-900 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: email.body.includes('<') ? email.body : email.body.replace(/\n/g, '<br>') 
                }}
              />
            </div>
          ) : (
            <div className="w-full flex-1 min-h-0 border border-gray-300 rounded-md flex flex-col">
              <CKEditor
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor={ClassicEditor as any}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleFieldChange('body', data);
                }}
                onReady={(editor) => {
                  editorRef.current = editor;
                  editor.setData(editedBody);
                }}
                config={{
                  toolbar: [
                    'heading', '|',
                    'bold', 'italic', 'underline', '|',
                    'bulletedList', 'numberedList', '|',
                    'outdent', 'indent', '|',
                    'link', 'blockQuote', 'insertTable', '|',
                    'undo', 'redo', '|',
                    'alignment', '|',
                    'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                    'strikethrough', 'subscript', 'superscript', '|',
                    'removeFormat'
                  ],
                  placeholder: 'Enter your email content...'
                }}
              />
            </div>
          )}
        </div>
        
        {/* Send Email Button Section - Always render to maintain consistent height */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
          {/* Status Message - Always reserve space to prevent height changes */}
          <div className={`mb-3 p-3 rounded-md text-sm transition-all duration-200 ${
            sendMessage 
              ? (sendStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200')
              : 'h-0 p-0 mb-0 opacity-0 overflow-hidden'
          }`}>
            {sendMessage && (
              <div className="flex items-center">
                {sendStatus === 'success' ? (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {sendMessage}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            {!readOnly ? (
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className={`px-6 py-2 rounded-md font-medium transition-colors mb-[50px] ${
                  isSending
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isSending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Email'
                )}
              </button>
            ) : (
              /* Placeholder content for read-only mode to maintain consistent height */
              <div className="px-6 py-2 text-sm text-gray-500">
                Read-only mode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
