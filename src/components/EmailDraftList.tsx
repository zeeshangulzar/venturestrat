'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@lib/api';

interface EmailDraft {
  id: string;
  to: string | string[];
  from: string;
  subject?: string;
  body: string;
  createdAt: string;
  investorId: string;
  investorName?: string;
}

interface EmailDraftListProps {
  userId: string;
  activeSection: 'all' | 'sent' | 'opened' | 'answered';
}

export default function EmailDraftList({ userId, activeSection }: EmailDraftListProps) {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(getApiUrl(`/api/messages/draft/${userId}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch email drafts: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle the backend response structure: { message, count, data: Array }
        if (data.data && Array.isArray(data.data)) {
          setDrafts(data.data);
        } else if (Array.isArray(data)) {
          setDrafts(data);
        } else if (data.drafts && Array.isArray(data.drafts)) {
          setDrafts(data.drafts);
        } else if (data.messages && Array.isArray(data.messages)) {
          setDrafts(data.messages);
        } else {
          console.log('Unexpected data structure:', data);
          setDrafts([]);
        }
      } catch (err) {
        console.error('Error fetching drafts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDrafts();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No emails found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {draft.subject || 'No Subject'}
              </h3>
              <p className="text-sm text-gray-600">
                To: {Array.isArray(draft.to) ? draft.to.join(', ') : draft.to} • From: {draft.from}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(draft.createdAt)}
            </span>
          </div>
          
          <div className="text-gray-700 text-sm leading-relaxed">
            {truncateText(draft.body)}
          </div>
          
          {draft.body.length > 150 && (
            <button className="text-blue-600 text-sm mt-2 hover:text-blue-800">
              Read more
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
