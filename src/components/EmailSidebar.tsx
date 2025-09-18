'use client';

import { useState } from 'react';

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

interface EmailSidebarProps {
  drafts: EmailDraft[];
  selectedEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
}

export default function EmailSidebar({ drafts, selectedEmailId, onEmailSelect }: EmailSidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getRecipients = (to: string | string[]) => {
    if (Array.isArray(to)) {
      return to.join(', ');
    }
    return to;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-auto">
      {/* Email List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {drafts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No emails found</p>
          </div>
        ) : (
          <div className='flex flex-col gap-2 p-[6px] pb-4'>
            {drafts.map((draft, index) => (
              <div key={draft.id}>
                <div
                  onClick={() => {
                    onEmailSelect(draft.id);
                  }}
                  className={`pt-[12px] pr-[15px] pb-[12px] pl-[10px] cursor-pointer hover:bg-gray-50 transition-colors border border-[#EEF3FD] rounded-[10px] ${
                    selectedEmailId === draft.id ? 'bg-gradient-to-r from-[rgba(37,99,235,0.04)] to-[rgba(37,99,235,0.15)]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[16px] leading-[16px] tracking-[-0.02em] text-[#0C2143] mb-2 truncate">
                        To: {getRecipients(draft.to)}
                      </p>
                      <p className="font-normal text-[14px] leading-[16px] tracking-[-0.02em] text-[#525A68] truncate">
                        Subject: {draft.subject}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
