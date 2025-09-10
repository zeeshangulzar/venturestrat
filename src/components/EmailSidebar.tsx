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
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Email Drafts</h2>
        <p className="text-sm text-gray-500">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {drafts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No email drafts found</p>
          </div>
        ) : (
          <div>
            {drafts.map((draft, index) => (
              <div key={draft.id}>
                <div
                  onClick={() => onEmailSelect(draft.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEmailId === draft.id ? 'border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">
                        To: {getRecipients(draft.to)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Subject: {draft.subject}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Only add border if not the last item */}
                {index < drafts.length && (
                  <div className="border-b border-gray-100"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
