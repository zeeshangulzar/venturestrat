'use client';

import React, { useState, useLayoutEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@lib/api';
import { appendSignatureToBody, useSignature } from '@utils/signature';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
  onSchedule: () => Promise<void> | void;
  email: {
    id: string;
    userId: string;
    investorId: string;
    to: string | string[];
    cc?: string | string[];
    subject?: string;
    body: string;
    from: string;
    threadId?: string;
    gmailMessageId?: string;
    gmailReferences?: string;
  } | null;
}

export default function ScheduleFollowUpModal({ isOpen, onClose, onSchedule, email }: ScheduleFollowUpModalProps) {
  const { signatureHtml } = useSignature();
  const { user } = useUser();
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (isOpen && email) {
      setError(null);
      setIsScheduling(false);
    }
  }, [isOpen, email?.id]);

  const investorName = useMemo(() => {
    if (!email) return 'there';
    if ((email as any)?.investor?.name) return (email as any).investor.name;
    if ((email as any)?.investorName) return (email as any).investorName;
    if (Array.isArray(email.to) && email.to.length) return email.to[0];
    if (typeof email.to === 'string') return email.to;
    return 'there';
  }, [email]);
  console.log('Investor Email:', email);

  const businessName =
    (user?.publicMetadata?.companyName as string) ||
    (email?.subject ? email.subject.replace(/^Re:\s*/i, '') : 'our company');

  const templates = useMemo(
    () => [
      {
        id: 'warm',
        title: 'Warm & Conversational',
        subject: `${businessName} follow-up`,
        body: `Hi ${investorName},
Hope your week’s going well!

Just circling back—completely understand if timing is tough. If you’re open to it, I’d love to get your thoughts on what we’re building at ${businessName}. Even a quick glance at a one-pager would help us know if we’re a potential fit.

Appreciate your time,`,
      },
      {
        id: 'nudge',
        title: 'Friendly, Light Nudge',
        subject: `${businessName} follow-up`,
        body: `Hi ${investorName},

Hope you’re well. Just wanted to follow up in case my earlier note about ${businessName} got lost in the inbox shuffle.

I believe what we’re building aligns with your focus and I’d be happy to share a short overview or jump on a quick call if that’s helpful.

Best,`,
      },
    ],
    [businessName, investorName]
  );

  if (!isOpen || !email) {
    return null;
  }

  const handleSchedule = async (subject: string, body: string) => {
    setIsScheduling(true);
    setError(null);

    try {
      const bodyWithSignature = appendSignatureToBody(body, signatureHtml);
      // Create scheduled email
      const response = await fetch(getApiUrl('/api/message/schedule'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: email.userId,
          investorId: email.investorId,
          to: Array.isArray(email.to) ? email.to : [email.to],
          cc: email.cc || [],
          subject,
          from: email.from,
          body: bodyWithSignature,
          scheduledFor: null,
          threadId: email.threadId,
           previousMessageId: email.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule email');
      }

      await onSchedule();

    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule email');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0c2143]/15 backdrop-blur-sm" />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 border border-gray-200">
        <div className="mb-3 px-3 py-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
          Email sent successfully!
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Follow-Up Email</h2>

        <p className="text-sm text-gray-600 mb-6">
          We will create a follow-up email now and keep it in your draft tab. You can pick a date and time later.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="border rounded-md p-4 hover:border-blue-400 transition-colors h-full flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="pr-2">
                  <p className="text-sm font-semibold text-gray-900">{tpl.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Subject: {tpl.subject}</p>
                </div>
                <button
                  onClick={() => handleSchedule(tpl.subject, tpl.body)}
                  disabled={isScheduling}
                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                >
                  {isScheduling ? 'Creating...' : 'Use this template'}
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-md p-3 flex-1">
                {tpl.body}
              </pre>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isScheduling}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
