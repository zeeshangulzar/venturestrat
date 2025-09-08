'use client';

import { useState } from 'react';
import { getApiUrl } from '@lib/api';

interface ChatGPTIntegrationProps {
  investor: {
    id: string;
    name: string;
    emails: Array<{ id: string; email: string; status: string }>;
    investorTypes: string[];
    stages: string[];
    markets: Array<{ market: { id: string; title: string } }>;
    pastInvestments: Array<{ pastInvestment: { id: string; title: string } }>;
  };
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
  };
  userData: {
    companyName?: string;
    businessSectors?: string[];
    stages?: string[];
    fundingAmount?: number;
    fundingCurrency?: string;
  };
  onEmailGenerated: (emailContent: string) => void;
  onError: (error: string) => void;
  onEmailCreated?: () => void; // New callback for when email is successfully created
}

export default function ChatGPTIntegration({
  investor,
  user,
  userData,
  onEmailGenerated,
  onError,
  onEmailCreated
}: ChatGPTIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateEmail = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare the prompt with all the necessary information
      const prompt = `Compose a brief outreach email to ${investor.name} about ${userData.companyName || 'our company'}, ensuring the message is well-structured and easy to read. Start with a one-line introduction of who you are (${user.firstName || ''} ${user.lastName || ''}, founder of ${userData.companyName || 'our company'}) and how your company's B2B business model is tackling a problem relevant to ${investor.name}'s focus on ${investor.markets.map(m => m.market.title).join(', ') || 'their investment focus'}. In the next part, provide a couple of key metrics or milestones as evidence of traction – you may format these as 2–3 bullet points (for example: growth rate, user base, revenue, or partnerships). Make sure to mention that you're raising a ${userData.stages?.[0] || 'funding'} round and that this aligns with ${investor.name}'s investment preferences. Personalize the email by referencing one of ${investor.name}'s past investments (e.g., "${investor.pastInvestments.map(p => p.pastInvestment.title).join(', ')}") as a way to highlight common ground or insight. Conclude the email with a confident call-to-action inviting ${investor.name} to continue the conversation (such as scheduling a call or reviewing your pitch deck)`;

      // Call ChatGPT API (you'll need to implement this endpoint)
      const response = await fetch('/api/chatgpt/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          investorName: investor.name,
          companyName: userData.companyName,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      const { subject, body, emailContent } = data;

      // Send the generated email to the backend
      const investorEmails = investor.emails.map(e => e.email);
      const userEmail = user.emailAddresses[0]?.emailAddress || '';

      const messageResponse = await fetch(getApiUrl('/api/message'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          investorId: investor.id,
          to: investorEmails,
          from: userEmail,
          subject: subject,
          body: body,
        }),
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to save email draft');
      }

      // Call the onEmailCreated callback to refresh the email list
      if (onEmailCreated) {
        onEmailCreated();
      }

      onEmailGenerated(emailContent);
    } catch (error) {
      console.error('Error generating email:', error);
      onError(error instanceof Error ? error.message : 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateEmail}
      disabled={isGenerating}
      className="flex-1 justify-center items-center px-5 py-2.5 gap-1 h-[39px] left-4 top-[394px] bg-[#2563EB] rounded-[10px] font-manrope not-italic font-medium text-[14px] leading-[19px] tracking-[-0.02em] text-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? 'Generating...' : 'AI Email'}
    </button>
  );
}
