'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@lib/api';

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
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'confirm' | 'form'>('confirm');

  console.log('🎭 ScheduleFollowUpModal render:', { isOpen, email: email ? 'exists' : 'null' });

  useEffect(() => {
    console.log('🎭 ScheduleFollowUpModal mounted with props:', { isOpen, hasEmail: !!email });
  }, [isOpen, email]);

  useEffect(() => {
    if (isOpen && email) {
      setCurrentStep('confirm');
      setScheduledDate('');
      setScheduledTime('');
      setError(null);
      setIsScheduling(false);
      setIsGenerating(false);
    }
  }, [isOpen, email?.id]);

  if (!isOpen || !email) {
    console.log('🎭 Modal returning null:', { isOpen, hasEmail: !!email });
    return null;
  }

  const handleCancel = async () => {
    setCurrentStep('confirm');
    setScheduledDate('');
    setScheduledTime('');
    await onClose();
  };

  if (currentStep === 'confirm') {
    return (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Follow-Up Email</h2>
          <p className="text-sm text-gray-600 mb-6">
            Do you want to schedule an automated follow-up email for this investor?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Not now
            </button>
            <button
              onClick={() => setCurrentStep('form')}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Yes, schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time');
      return;
    }

    setIsScheduling(true);
    setError(null);

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

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
          body: followUpBody,
          scheduledFor: scheduledDateTime.toISOString(),
          threadId: email.threadId,
           previousMessageId: email.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule email');
      }

      await onSchedule();
      setCurrentStep('confirm');
      setScheduledDate('');
      setScheduledTime('');

    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule email');
    } finally {
      setIsScheduling(false);
      setIsGenerating(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  const minDateTime = getMinDateTime();

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Follow-Up Email</h2>

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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDateTime.date}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={scheduledDate === minDateTime.date ? minDateTime.time : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="text-sm text-gray-600 mt-4">
            <p className="mb-2">The system will automatically:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Generate a follow-up email using AI</li>
              <li>Send it at the scheduled time</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            disabled={isScheduling}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={isScheduling || !scheduledDate || !scheduledTime}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isScheduling ? 'Scheduling...' : 'Schedule Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
