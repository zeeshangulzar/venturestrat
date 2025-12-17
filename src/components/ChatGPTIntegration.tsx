'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@lib/api';
import { appendSignatureToBody, buildSignatureHtml, useSignature } from '@utils/signature';
import SubscriptionLimitModal from './SubscriptionLimitModal';

interface ChatGPTIntegrationProps {
  investor: {
    id: string;
    name: string;
    emails: Array<{ id: string; email: string; status: string }>;
    investorTypes: string[];
    stages: string[];
    markets: Array<{ market: { id: string; title: string } }>;
    pastInvestments: Array<{ pastInvestment: { id: string; title: string } }>;
    hasDraft?: boolean;
  };
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
    imageUrl?: string;
    profileImageUrl?: string | null;
    publicMetadata?: Record<string, unknown>;
  };
  userData: {
    companyName?: string;
    companyLogo?: string;
    companyWebsite?: string;
    incorporationCountry?: string;
    operationalRegions?: string[];
    phone?: string;
    phoneNumber?: string;
    location?: string;
    businessSectors?: string[];
    stages?: string;
    fundingAmount?: number;
    revenue?: string;
    fundingCurrency?: string;
  };
  onEmailGenerated: (emailContent: string) => void;
  onError: (error: string) => void;
  onEmailCreated?: (emailId: string, isAIEmail?: boolean) => void; // Updated to include AI email flag
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
  const [hasDraft, setHasDraft] = useState(investor.hasDraft ?? false);
  const { signatureHtml } = useSignature();

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalData, setLimitModalData] = useState<any>(null);
  
  useEffect(() => {
    setHasDraft(investor.hasDraft ?? false);
  }, [investor.hasDraft]);

  const generateEmail = async () => {
    setIsGenerating(true);
    
    try {
        // Extract titles from the first two past investments
        const pastInvestments = investor.pastInvestments || [];
        const selectedPastInvestments = pastInvestments
          .slice(0, 2) // Take first two
          .map(p => p.pastInvestment?.title || '')
          .filter(Boolean); // Remove empty strings
        
        const pastInvestmentsText = selectedPastInvestments.length > 0 
          ? selectedPastInvestments.join(', ')
          : 'their past investments';

        // Prepare the prompt with all the necessary information
        const prompt = `Compose a brief outreach email to ${investor.name} about ${userData.companyName || 'our company'}, ensuring the message is well-structured and easy to read. Start with a one-line introduction of who you are (${user.firstName || ''} ${user.lastName || ''}, founder of ${userData.companyName || 'our company'}) and how your company is tackling a problem — if the (business model = '') is not provided, infer a simple one-line business description based on the website https://rtyst.com/ . In the next part, provide a couple of key metrics or milestones as evidence of traction (${userData.revenue})– you may format these as 2–3 bullet points (for example: growth rate, user base, revenue, or partnerships). Make sure to mention that you're raising a ${userData.stages || 'funding'} round and that this aligns with ${investor.name}'s investment preferences. Personalize the email by referencing some of ${investor.name}'s past investments (for example: "${pastInvestmentsText}") as a way to highlight common ground or insight.`;

        console.log("here is prompt", prompt)
      // Call ChatGPT API (you'll need to implement this endpoint)
      const response = await fetch('/api/chatgpt/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: user.id,
          investorName: investor.name,
          companyName: userData.companyName,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.error === 'Subscription limit reached') {
          setLimitModalData({
            action: 'ai_draft',
            currentUsage: errorData.currentUsage,
            limits: errorData.limits
          });
          setShowLimitModal(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to generate email');
      }

      const data = await response.json();
      const { subject, body, emailContent } = data;
      const bodyWithSignature = appendSignatureToBody(body, signatureHtml);

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
          body: bodyWithSignature,
        }),
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to save email draft');
      }

      const createdEmail = await messageResponse.json();
      const emailId = createdEmail.id || createdEmail.message?.id || createdEmail.data?.id;

      // Call the onEmailCreated callback to refresh the email list and pass the email ID with AI flag
      if (onEmailCreated && emailId) {
        onEmailCreated(emailId, true); // true indicates this is an AI-generated email
      }
      setHasDraft(true);
      onEmailGenerated('Email draft created successfully!');
    } catch (error) {
      console.error('Error generating email:', error);
      onError(error instanceof Error ? error.message : 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={generateEmail}
        disabled={isGenerating || hasDraft}
        className={`w-full justify-center items-center ${isGenerating ? "px-2" : "px-5"} py-2.5 gap-1 h-[auto] left-4 top-[394px] bg-[#2563EB] rounded-[10px] font-manrope not-italic font-medium text-[14px] leading-[19px] tracking-[-0.02em] text-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
      >
        {isGenerating
          ? 'Loading...'
          : hasDraft
            ? 'Email Drafted'
            : 'AI Email'}
      </button>
      
      {showLimitModal && limitModalData && (
        <SubscriptionLimitModal
          isOpen={showLimitModal}
          onClose={() => {
            setShowLimitModal(false);
            setIsGenerating(false); // Reset generating state
          }}
          action={limitModalData.action}
          currentUsage={limitModalData.currentUsage}
          limits={limitModalData.limits}
        />
      )}
    </>
  );
}
