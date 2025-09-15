'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AIEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onCopy: (text: string) => void;
  onAddNew: (text: string) => void;
  onReplace: (text: string) => void;
  onGenerateAI: (prompt: string, selectedText: string, previousResponse?: string) => Promise<string>;
}

export default function AIEditModal({
  isOpen,
  onClose,
  selectedText,
  onCopy,
  onAddNew,
  onReplace,
  onGenerateAI
}: AIEditModalProps) {
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear all states immediately when modal opens
      setPrompt('');
      setAiResponse('');
      setError('');
      setCopySuccess(false);
    }
  }, [isOpen, selectedText]);

  // Clear prompt when AI response is shown to show placeholder in footer
  useEffect(() => {
    if (aiResponse) {
      setPrompt('');
    }
  }, [aiResponse]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await onGenerateAI(prompt.trim(), selectedText, aiResponse);
      setAiResponse(response);
    } catch (err) {
      console.error('AIEditModal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isGenerating) {
        handleGenerate();
      }
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to modal backdrop
    if (aiResponse) {
      onCopy(aiResponse);
      setCopySuccess(true);
      // Hide success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const handleAddNew = () => {
    if (aiResponse) {
      onAddNew(aiResponse);
      onClose();
    }
  };

  const handleReplace = () => {
    if (aiResponse) {
      onReplace(aiResponse);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border border-[#EDEEEF] shadow-[4px_4px_28px_rgba(30,41,59,0.2)] rounded-[10px]">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hidden Selected Text Field */}
          <input
            type="hidden"
            value={selectedText}
            readOnly
          />

          {/* Search Bar */}
        {!aiResponse && (
          <div className="">
            <div className="relative">
              <div className="relative">
                {/* Custom Input with JSX Placeholder */}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-4 bg-white rounded-full border-0 focus:outline-none transition-colors text-gray-700"
                    disabled={isGenerating}
                  />
                  
                  {/* Logo - Always visible */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="22" height="22" rx="6" fill="#2563EB"/>
                      <path d="M4 5.16075V10.3943C4 10.6067 4.16409 10.7772 4.36577 10.7772H7.09149C7.29567 10.7772 7.46101 10.6041 7.46101 10.3903V5.16075C7.46101 4.94831 7.29692 4.77784 7.09525 4.77784H4.36577C4.16409 4.77653 4 4.94831 4 5.16075Z" fill="white"/>
                      <path d="M14.4311 4.95486L11.0101 10.6001C10.9425 10.7116 10.826 10.7785 10.7007 10.7785H7.80717C7.60425 10.7785 7.44141 10.9503 7.44141 11.1614V16.3949C7.44141 16.6074 7.6055 16.7778 7.80717 16.7778H10.7007C10.826 16.7778 10.9425 16.711 11.0101 16.5995L14.4311 10.9542C14.4987 10.8427 14.6152 10.7759 14.7405 10.7759H17.634C17.837 10.7759 17.9998 10.6041 17.9998 10.393V5.16074C17.9998 4.94831 17.8357 4.77783 17.634 4.77783H14.7405C14.6152 4.77783 14.4987 4.84471 14.4311 4.95617V4.95486Z" fill="white"/>
                    </svg>
                  </div>
                  
                  {/* Placeholder text - Only when no prompt */}
                  {!prompt && (
                    <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center">
                      <span className="not-italic font-medium text-[14px] leading-[26px] tracking-[-0.02em] text-[#525A68]">How i can help?</span>
                    </div>
                  )}
                  
                  {/* Right Search Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isGenerating ? (
                      <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Copy Success Message */}
          {copySuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-700">Text copied to clipboard!</span>
              </div>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="mb-6">
              <div className="max-h-40 overflow-y-auto p-6">
                {aiResponse}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {aiResponse && (
          <div className="p-6">
            <div className="flex gap-3 items-center">
              <div className="relative bg-white border border-[#EDEEEF] rounded-[10px] w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-[#EDEEEF] rounded-[10px]"
                  disabled={isGenerating}
                /> 
                 {/* Logo - Always visible */}
                 <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center">
                   <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect width="22" height="22" rx="6" fill="#2563EB"/>
                     <path d="M4 5.16075V10.3943C4 10.6067 4.16409 10.7772 4.36577 10.7772H7.09149C7.29567 10.7772 7.46101 10.6041 7.46101 10.3903V5.16075C7.46101 4.94831 7.29692 4.77784 7.09525 4.77784H4.36577C4.16409 4.77653 4 4.94831 4 5.16075Z" fill="white"/>
                     <path d="M14.4311 4.95486L11.0101 10.6001C10.9425 10.7116 10.826 10.7785 10.7007 10.7785H7.80717C7.60425 10.7785 7.44141 10.9503 7.44141 11.1614V16.3949C7.44141 16.6074 7.6055 16.7778 7.80717 16.7778H10.7007C10.826 16.7778 10.9425 16.711 11.0101 16.5995L14.4311 10.9542C14.4987 10.8427 14.6152 10.7759 14.7405 10.7759H17.634C17.837 10.7759 17.9998 10.6041 17.9998 10.393V5.16074C17.9998 4.94831 17.8357 4.77783 17.634 4.77783H14.7405C14.6152 4.77783 14.4987 4.84471 14.4311 4.95617V4.95486Z" fill="white"/>
                   </svg>
                 </div>
                 
                 {/* Placeholder text - Only when no prompt */}
                 {!prompt && (
                   <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center">
                     <span className="not-italic font-medium text-[14px] leading-[26px] tracking-[-0.02em] text-[#525A68]">Ask VentureStrat AI generate again...?</span>
                   </div>
                 )}
                
                {/* Right Search Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isGenerating ? (
                    <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
               <button
                 onClick={(e) => handleCopy(e)}
                 className="w-[32px] h-[32px] bg-white border border-[#EDEEEF] rounded-[10px] flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 p-[5px]"
                 title="Copy to clipboard"
               >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1403_3469)">
                  <path d="M5.25 7.25025C5.25 6.71975 5.46074 6.21098 5.83586 5.83586C6.21098 5.46074 6.71975 5.25 7.25025 5.25H13.7498C14.0124 5.25 14.2725 5.30174 14.5152 5.40226C14.7579 5.50278 14.9784 5.65012 15.1641 5.83586C15.3499 6.0216 15.4972 6.24211 15.5977 6.48479C15.6983 6.72747 15.75 6.98757 15.75 7.25025V13.7498C15.75 14.0124 15.6983 14.2725 15.5977 14.5152C15.4972 14.7579 15.3499 14.9784 15.1641 15.1641C14.9784 15.3499 14.7579 15.4972 14.5152 15.5977C14.2725 15.6983 14.0124 15.75 13.7498 15.75H7.25025C6.98757 15.75 6.72747 15.6983 6.48479 15.5977C6.24211 15.4972 6.0216 15.3499 5.83586 15.1641C5.65012 14.9784 5.50278 14.7579 5.40226 14.5152C5.30174 14.2725 5.25 14.0124 5.25 13.7498V7.25025Z" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.009 12.5527C2.77901 12.4216 2.5877 12.2321 2.45443 12.0034C2.32116 11.7746 2.25064 11.5147 2.25 11.25V3.75C2.25 2.925 2.925 2.25 3.75 2.25H11.25C11.8125 2.25 12.1185 2.53875 12.375 3" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_1403_3469">
                  <rect width="18" height="18" fill="white"/>
                  </clipPath>
                  </defs>
                </svg>
               </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 rbg-white border border-[#EDEEEF] rounded-[10px] transition-colors"
              >
                <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1403_3476)">
                      <path d="M3.33301 14.9999V11.6666C3.33301 11.4456 3.42081 11.2336 3.57709 11.0773C3.73337 10.921 3.94533 10.8333 4.16634 10.8333H15.833C16.054 10.8333 16.266 10.921 16.4223 11.0773C16.5785 11.2336 16.6663 11.4456 16.6663 11.6666V14.9999C16.6663 15.2209 16.5785 15.4329 16.4223 15.5892C16.266 15.7455 16.054 15.8333 15.833 15.8333H4.16634C3.94533 15.8333 3.73337 15.7455 3.57709 15.5892C3.42081 15.4329 3.33301 15.2209 3.33301 14.9999Z" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 7.49996V4.16663" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.33301 5.83325H11.6663" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1403_3476">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                  Add New
                </div>
              </button>
              <button
                onClick={handleReplace}
                className="text-center px-4 py-2 bg-[#0C2143] text-white border border-[#EDEEEF] rounded-[10px] not-italic font-medium text-[12px] leading-[26px] tracking-[-0.02em]"
              >
                <p className='w-[max-content]'>Replace text</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
