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
  readOnly?: boolean;
}

export default function EmailViewer({ email, onEmailUpdate, readOnly = false }: EmailViewerProps) {
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [editedFrom, setEditedFrom] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Debounced auto-save functionality (same pattern as settings page)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to store current values for auto-save (to avoid dependency issues)
  const currentValuesRef = useRef({
    editedSubject: '',
    editedBody: '',
    editedFrom: ''
  });

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
    }
  }, [email, readOnly, onEmailUpdate]);
  
  const debouncedAutoSave = useCallback(() => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for 3 seconds after user stops typing (increased for better UX)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);
  }, [autoSave]);

  // Handle field changes with auto-save
  const handleFieldChange = (field: string, value: string) => {
    console.log('Field change debug:', { field, value });
    
    switch (field) {
      case 'subject':
        setEditedSubject(value);
        currentValuesRef.current.editedSubject = value;
        break;
      case 'body':
        setEditedBody(value);
        currentValuesRef.current.editedBody = value;
        break;
      case 'from':
        setEditedFrom(value);
        currentValuesRef.current.editedFrom = value;
        break;
    }
    // Use debounced auto-save (same pattern as settings page)
    debouncedAutoSave();
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
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
                className="w-full text-lg font-semibold border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
              />
            )}
          </div>
          
          {!readOnly && (
            <div className="flex items-center space-x-2 ml-4">
              {isSaving && (
                <span className="text-blue-600 text-sm">Saving...</span>
              )}
              {saveStatus === 'success' && (
                <span className="text-green-600 text-sm">Saved!</span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600 text-sm">Save failed</span>
              )}
            </div>
          )}
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
      <div className="flex-1 p-4">
        <div className="h-full">
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
            <div className="w-full h-full min-h-[400px] border border-gray-300 rounded-md">
              <CKEditor
                editor={ClassicEditor as any}
                data={editedBody}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleFieldChange('body', data);
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
                } as any}
                {...({} as any)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
