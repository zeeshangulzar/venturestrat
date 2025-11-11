'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@lib/api';
import { useUserCompany } from '../hooks/useUserCompany';
import { appendSignatureToBody, buildSignatureHtml } from '@utils/signature';

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
  const {
    companyLogo: storedCompanyLogo,
    companyName: fallbackCompanyName,
  } = useUserCompany();

  const signatureMetadata = (() => {
    const primaryEmail = user.emailAddresses?.[0]?.emailAddress?.trim() ?? '';
    const first = user.firstName?.trim() ?? '';
    const last = user.lastName?.trim() ?? '';
    const displayName = [first, last].filter(Boolean).join(' ') || primaryEmail;
    const clerkPublicMetadata = user.publicMetadata as Record<string, unknown> | undefined;
    const positionCandidates = [
      (userData as Record<string, unknown> | null)?.title,
      (userData as Record<string, unknown> | null)?.role,
      (userData as Record<string, unknown> | null)?.position,
      clerkPublicMetadata?.position,
    ];
    const position = positionCandidates
      .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
      .find((value) => value.length > 0);

    const companyNameCandidate =
      (typeof userData?.companyName === 'string' && userData.companyName.trim()) ||
      (typeof clerkPublicMetadata?.companyName === 'string'
        ? (clerkPublicMetadata.companyName as string).trim()
        : '') ||
      fallbackCompanyName ||
      '';

    const backendLogoCandidates = [
      storedCompanyLogo,
      userData?.companyLogo,
      clerkPublicMetadata?.companyLogo,
    ];

    const backendLogo = backendLogoCandidates
      .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
      .find((value) => value.length > 0);

    const fallbackLogo = [user.profileImageUrl, user.imageUrl]
      .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
      .find((value) => value.length > 0);

    return {
      displayName,
      email: primaryEmail,
      position,
      companyName: companyNameCandidate,
      logoUrl: backendLogo || fallbackLogo || undefined,
    };
  })();

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

      const signatureHtml = buildSignatureHtml(signatureMetadata);
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
  );
}
