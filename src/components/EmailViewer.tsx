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
        // Reset flag after editor data is set
        setTimeout(() => {
          isSettingInitialDataRef.current = false;
        }, 200);
      } else {
        // If editor is not ready, reset flag after longer delay
        // The onReady callback will handle setting the data
        setTimeout(() => {
          isSettingInitialDataRef.current = false;
        }, 500);
      }
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
    // Skip auto-save if we're setting initial data
    if (isSettingInitialDataRef.current) {
      return;
    }
    
    // Check if the value actually changed to prevent unnecessary saves
    const currentValue = currentValuesRef.current[`edited${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof currentValuesRef.current];
    if (currentValue === value) {
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
               <div className='flex items-center w-full text-lg font-semibold border bg-[#F6F9FE] border-[#EDEEEF] px-3 py-2 rounded-[10px]'>
                 <input
                   type="text"
                   value={editedSubject}
                   onChange={(e) => handleFieldChange('subject', e.target.value)}
                   className="flex-1 not-italic font-bold text-[16px] leading-[16px] tracking-[-0.02em] capitalize text-[#0C2143] bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                   placeholder="Email subject"
                 />
                 <svg width="91" height="20" viewBox="0 0 91 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2 flex-shrink-0">
                   <rect width="91" height="20" rx="10" fill="#FFEFD8"/>
                   <g clipPath="url(#clip0_1403_3373)">
                   <path d="M8.66699 15.3335H11.3337L18.3337 8.33345C18.5088 8.15836 18.6476 7.95049 18.7424 7.72171C18.8372 7.49294 18.8859 7.24774 18.8859 7.00012C18.8859 6.7525 18.8372 6.5073 18.7424 6.27853C18.6476 6.04975 18.5088 5.84188 18.3337 5.66679C18.1586 5.49169 17.9507 5.3528 17.7219 5.25804C17.4931 5.16328 17.2479 5.1145 17.0003 5.1145C16.7527 5.1145 16.5075 5.16328 16.2787 5.25804C16.05 5.3528 15.8421 5.49169 15.667 5.66679L8.66699 12.6668V15.3335Z" stroke="#0C2143" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M15 6.33337L17.6667 9.00004" stroke="#0C2143" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M16 14.6667L17.3333 16L20 13.3334" stroke="#0C2143" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                   </g>
                   <path d="M24.84 15V6.36H30.3V7.374H25.908V10.08H29.58V11.094H25.908V13.986H30.3V15H24.84ZM39.2483 15L39.2543 10.854C39.2543 10.37 39.1243 9.992 38.8643 9.72C38.6083 9.444 38.2743 9.306 37.8623 9.306C37.6223 9.306 37.3943 9.362 37.1783 9.474C36.9623 9.582 36.7863 9.754 36.6503 9.99C36.5143 10.222 36.4463 10.52 36.4463 10.884L35.8823 10.656C35.8743 10.196 35.9683 9.794 36.1643 9.45C36.3643 9.102 36.6363 8.832 36.9803 8.64C37.3243 8.448 37.7123 8.352 38.1443 8.352C38.8203 8.352 39.3523 8.558 39.7403 8.97C40.1283 9.378 40.3223 9.928 40.3223 10.62L40.3163 15H39.2483ZM31.4963 15V8.52H32.4503V10.254H32.5703V15H31.4963ZM35.3783 15L35.3843 10.896C35.3843 10.4 35.2563 10.012 35.0003 9.732C34.7443 9.448 34.4043 9.306 33.9803 9.306C33.5603 9.306 33.2203 9.45 32.9603 9.738C32.7003 10.026 32.5703 10.408 32.5703 10.884L32.0063 10.548C32.0063 10.128 32.1063 9.752 32.3063 9.42C32.5063 9.088 32.7783 8.828 33.1223 8.64C33.4663 8.448 33.8563 8.352 34.2923 8.352C34.7283 8.352 35.1083 8.444 35.4323 8.628C35.7563 8.812 36.0063 9.076 36.1823 9.42C36.3583 9.76 36.4463 10.166 36.4463 10.638L36.4403 15H35.3783ZM43.4872 15.18C43.0032 15.18 42.5972 15.092 42.2692 14.916C41.9452 14.736 41.6992 14.5 41.5312 14.208C41.3672 13.916 41.2852 13.596 41.2852 13.248C41.2852 12.908 41.3492 12.614 41.4772 12.366C41.6092 12.114 41.7932 11.906 42.0292 11.742C42.2652 11.574 42.5472 11.442 42.8752 11.346C43.1832 11.262 43.5272 11.19 43.9072 11.13C44.2912 11.066 44.6792 11.008 45.0712 10.956C45.4632 10.904 45.8292 10.854 46.1692 10.806L45.7852 11.028C45.7972 10.452 45.6812 10.026 45.4372 9.75C45.1972 9.474 44.7812 9.336 44.1892 9.336C43.7972 9.336 43.4532 9.426 43.1572 9.606C42.8652 9.782 42.6592 10.07 42.5392 10.47L41.5252 10.164C41.6812 9.596 41.9832 9.15 42.4312 8.826C42.8792 8.502 43.4692 8.34 44.2012 8.34C44.7892 8.34 45.2932 8.446 45.7132 8.658C46.1372 8.866 46.4412 9.182 46.6252 9.606C46.7172 9.806 46.7752 10.024 46.7992 10.26C46.8232 10.492 46.8352 10.736 46.8352 10.992V15H45.8872V13.446L46.1092 13.59C45.8652 14.114 45.5232 14.51 45.0832 14.778C44.6472 15.046 44.1152 15.18 43.4872 15.18ZM43.6492 14.286C44.0332 14.286 44.3652 14.218 44.6452 14.082C44.9292 13.942 45.1572 13.76 45.3292 13.536C45.5012 13.308 45.6132 13.06 45.6652 12.792C45.7252 12.592 45.7572 12.37 45.7612 12.126C45.7692 11.878 45.7732 11.688 45.7732 11.556L46.1452 11.718C45.7972 11.766 45.4552 11.812 45.1192 11.856C44.7832 11.9 44.4652 11.948 44.1652 12C43.8652 12.048 43.5952 12.106 43.3552 12.174C43.1792 12.23 43.0132 12.302 42.8572 12.39C42.7052 12.478 42.5812 12.592 42.4852 12.732C42.3932 12.868 42.3472 13.038 42.3472 13.242C42.3472 13.418 42.3912 13.586 42.4792 13.746C42.5712 13.906 42.7112 14.036 42.8992 14.136C43.0912 14.236 43.3412 14.286 43.6492 14.286ZM48.2752 7.374V6.27H49.3432V7.374H48.2752ZM48.2752 15V8.52H49.3432V15H48.2752ZM51.0234 15V6.18H52.0914V15H51.0234ZM55.8141 15V6.36H58.4781C58.5661 6.36 58.7201 6.362 58.9401 6.366C59.1601 6.37 59.3701 6.386 59.5701 6.414C60.2381 6.502 60.7961 6.746 61.2441 7.146C61.6961 7.542 62.0361 8.046 62.2641 8.658C62.4921 9.27 62.6061 9.944 62.6061 10.68C62.6061 11.416 62.4921 12.09 62.2641 12.702C62.0361 13.314 61.6961 13.82 61.2441 14.22C60.7961 14.616 60.2381 14.858 59.5701 14.946C59.3701 14.97 59.1581 14.986 58.9341 14.994C58.7141 14.998 58.5621 15 58.4781 15H55.8141ZM56.9121 13.98H58.4781C58.6301 13.98 58.8001 13.976 58.9881 13.968C59.1761 13.956 59.3401 13.938 59.4801 13.914C59.9521 13.826 60.3341 13.628 60.6261 13.32C60.9181 13.012 61.1321 12.628 61.2681 12.168C61.4041 11.708 61.4721 11.212 61.4721 10.68C61.4721 10.136 61.4021 9.634 61.2621 9.174C61.1261 8.714 60.9121 8.332 60.6201 8.028C60.3281 7.724 59.9481 7.53 59.4801 7.446C59.3401 7.418 59.1741 7.4 58.9821 7.392C58.7901 7.384 58.6221 7.38 58.4781 7.38H56.9121V13.98ZM63.742 15V8.52H64.696V10.086L64.54 9.882C64.616 9.682 64.714 9.498 64.834 9.33C64.958 9.162 65.096 9.024 65.248 8.916C65.416 8.78 65.606 8.676 65.818 8.604C66.03 8.532 66.246 8.49 66.466 8.478C66.686 8.462 66.892 8.476 67.084 8.52V9.522C66.86 9.462 66.614 9.446 66.346 9.474C66.078 9.502 65.83 9.6 65.602 9.768C65.394 9.916 65.232 10.096 65.116 10.308C65.004 10.52 64.926 10.75 64.882 10.998C64.838 11.242 64.816 11.492 64.816 11.748V15H63.742ZM69.6097 15.18C69.1257 15.18 68.7197 15.092 68.3917 14.916C68.0677 14.736 67.8217 14.5 67.6537 14.208C67.4897 13.916 67.4077 13.596 67.4077 13.248C67.4077 12.908 67.4717 12.614 67.5997 12.366C67.7317 12.114 67.9157 11.906 68.1517 11.742C68.3877 11.574 68.6697 11.442 68.9977 11.346C69.3057 11.262 69.6497 11.19 70.0297 11.13C70.4137 11.066 70.8017 11.008 71.1937 10.956C71.5857 10.904 71.9517 10.854 72.2917 10.806L71.9077 11.028C71.9197 10.452 71.8037 10.026 71.5597 9.75C71.3197 9.474 70.9037 9.336 70.3117 9.336C69.9197 9.336 69.5757 9.426 69.2797 9.606C68.9877 9.782 68.7817 10.07 68.6617 10.47L67.6477 10.164C67.8037 9.596 68.1057 9.15 68.5537 8.826C69.0017 8.502 69.5917 8.34 70.3237 8.34C70.9117 8.34 71.4157 8.446 71.8357 8.658C72.2597 8.866 72.5637 9.182 72.7477 9.606C72.8397 9.806 72.8977 10.024 72.9217 10.26C72.9457 10.492 72.9577 10.736 72.9577 10.992V15H72.0097V13.446L72.2317 13.59C71.9877 14.114 71.6457 14.51 71.2057 14.778C70.7697 15.046 70.2377 15.18 69.6097 15.18ZM69.7717 14.286C70.1557 14.286 70.4877 14.218 70.7677 14.082C71.0517 13.942 71.2797 13.76 71.4517 13.536C71.6237 13.308 71.7357 13.06 71.7877 12.792C71.8477 12.592 71.8797 12.37 71.8837 12.126C71.8917 11.878 71.8957 11.688 71.8957 11.556L72.2677 11.718C71.9197 11.766 71.5777 11.812 71.2417 11.856C70.9057 11.9 70.5877 11.948 70.2877 12C69.9877 12.048 69.7177 12.106 69.4777 12.174C69.3017 12.23 69.1357 12.302 68.9797 12.39C68.8277 12.478 68.7037 12.592 68.6077 12.732C68.5157 12.868 68.4697 13.038 68.4697 13.242C68.4697 13.418 68.5137 13.586 68.6017 13.746C68.6937 13.906 68.8337 14.036 69.0217 14.136C69.2137 14.236 69.4637 14.286 69.7717 14.286ZM74.8957 15V8.166C74.8957 7.998 74.9037 7.828 74.9197 7.656C74.9357 7.48 74.9717 7.31 75.0277 7.146C75.0837 6.978 75.1757 6.824 75.3037 6.684C75.4517 6.52 75.6137 6.404 75.7897 6.336C75.9657 6.264 76.1437 6.22 76.3237 6.204C76.5077 6.188 76.6817 6.18 76.8457 6.18H77.6677V7.068H76.9057C76.5897 7.068 76.3537 7.146 76.1977 7.302C76.0417 7.454 75.9637 7.686 75.9637 7.998V15H74.8957ZM73.7977 9.402V8.52H77.6677V9.402H73.7977ZM82.0033 15C81.6193 15.076 81.2393 15.106 80.8633 15.09C80.4913 15.078 80.1593 15.004 79.8673 14.868C79.5753 14.728 79.3533 14.512 79.2013 14.22C79.0733 13.964 79.0033 13.706 78.9913 13.446C78.9833 13.182 78.9793 12.884 78.9793 12.552V6.72H80.0473V12.504C80.0473 12.768 80.0493 12.994 80.0533 13.182C80.0613 13.37 80.1033 13.532 80.1793 13.668C80.3233 13.924 80.5513 14.074 80.8633 14.118C81.1793 14.162 81.5593 14.15 82.0033 14.082V15ZM77.6653 9.402V8.52H82.0033V9.402H77.6653Z" fill="#0C2143"/>
                   <defs>
                   <clipPath id="clip0_1403_3373">
                   <rect width="16" height="16" fill="white" transform="translate(6 2)"/>
                   </clipPath>
                   </defs>
                 </svg>
               </div>
            )}
          </div>
        </div>

        {/* Email Metadata */}
        <div className="space-y-4 text-sm">
          {/* From Field - First */}
          {/* <div>
            <span className="font-medium text-gray-700">From:</span>
            {readOnly ? (
              <span className="ml-2 text-gray-900">{email.from}</span>
            ) : (
              <input
                type="email"
                value={editedFrom}
                onChange={(e) => handleFieldChange('from', e.target.value)}
                className="ml-2 border border-gray-300 rounded px-2 py-1 focus:outline-none w-full max-w-md min-w-0"
                placeholder="sender@example.com"
                disabled
                style={{ minWidth: '200px' }}
              />
            )}
          </div> */}
          
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
            <div className="w-full flex-1 min-h-0 flex flex-col">
              <CKEditor
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor={ClassicEditor as any}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleFieldChange('body', data);
                }}
                onReady={(editor) => {
                  editorRef.current = editor;
                  // Set flag to prevent auto-save when setting initial data
                  isSettingInitialDataRef.current = true;
                  editor.setData(editedBody);
                  // Reset flag after editor data is set
                  setTimeout(() => {
                    isSettingInitialDataRef.current = false;
                  }, 200);
                }}
                config={{
                  toolbar: [
                    'fontFamily', 'fontSize', '|',
                    'bold', 'underline', 'fontColor', 'italic', 'strikethrough', '|',
                    'numberedList', 'bulletedList'
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
            <div
              className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors mb-[50px] ${
                isSending
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              <button
                onClick={handleSendEmail}
                disabled={isSending}
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
                  'Send'
                )}
              </button>
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1403_3442)">
                <path d="M16.333 10H4.66634" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.333 10L12.9997 13.3333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.333 10.0001L12.9997 6.66675" stroke="white" strokeWidth="1.5" stroke-winecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_1403_3442">
                <rect width="20" height="20" fill="white" transform="matrix(-1 0 0 1 20.5 0)"/>
                </clipPath>
                </defs>
              </svg>
            </div>
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
