'use client';

import React, { useState, useLayoutEffect } from 'react';
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
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useLayoutEffect(() => {
    if (isOpen && email) {
      setError(null);
      setIsScheduling(false);
      setIsGenerating(false);
    }
  }, [isOpen, email?.id]);

  if (!isOpen || !email) {
    return null;
  }

  const handleSchedule = async () => {
    setIsScheduling(true);
    setError(null);

    try {
      // Generate follow-up email using ChatGPT
      setIsGenerating(true);
      const prompt = `Generate a professional follow-up email based on this conversation. The email should be concise, respectful, and add value to the conversation. Use the same tone and style as the original message.

Original email subject: ${email.subject || 'Partnership Opportunity'}
Original email body: ${email.body}

Generate a follow-up that:
1. References the previous email
2. Adds new value or information
3. Maintains a professional and friendly tone
4. Is brief and to the point`;

      // Call ChatGPT API to generate follow-up
      const chatgptResponse = await fetch('/api/chatgpt/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const chatgptData = await chatgptResponse.json();
      const followUpSubject = chatgptData.subject || `Re: ${email.subject}`;
      const followUpBody = chatgptData.body || email.body;
      const bodyWithSignature = appendSignatureToBody(followUpBody, signatureHtml);

      setIsGenerating(false);

      // Create scheduled email
      const response = await fetch(getApiUrl('/api/message/schedule'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: email.userId,
          investorId: email.investorId,
          to: Array.isArray(email.to) ? email.to : [email.to],
          cc: email.cc || [],
          subject: followUpSubject,
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
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0c2143]/15 backdrop-blur-sm" />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
        <div className="mb-3 px-3 py-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
          Email sent successfully!
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Follow-Up Email</h2>

        <p className="text-sm text-gray-600 mb-6">
          We will create a follow-up email now and keep it in your Schedule tab. You can pick a date and time later.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {isGenerating && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
            Generating follow-up email with AI...
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isScheduling || isGenerating}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={isScheduling}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isScheduling ? 'Creating...' : 'Yes, schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
