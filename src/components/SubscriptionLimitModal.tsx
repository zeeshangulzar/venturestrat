'use client';

import React from 'react';
import { useSubscription } from '@contexts/SubscriptionContext';

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'ai_draft' | 'send_email' | 'add_investor' | 'download_csv';
  currentUsage: {
    aiDraftsUsed?: number;
    emailsSent?: number;
    investorsAdded?: number;
    monthlyEmailsSent?: number;
    monthlyInvestorsAdded?: number;
  };
  limits: {
    aiDraftsPerDay?: number;
    emailsPerDay?: number;
    investorsPerDay?: number;
    emailsPerMonth?: number;
    investorsPerMonth?: number;
  };
}

export default function SubscriptionLimitModal({
  isOpen,
  onClose,
  action,
  currentUsage,
  limits
}: SubscriptionLimitModalProps) {
  const { subscriptionInfo } = useSubscription();

  if (!isOpen) return null;

  const getActionText = () => {
    switch (action) {
      case 'ai_draft':
        return 'AI Email Draft';
      case 'send_email':
        return 'Send Email';
      case 'add_investor':
        return 'Add Investor to CRM';
      case 'download_csv':
        return 'Download CSV File';
      default:
        return 'Action';
    }
  };

  const getLimitText = () => {
    switch (action) {
      case 'ai_draft':
        return `${currentUsage.aiDraftsUsed || 0}/${limits.aiDraftsPerDay || 0} AI drafts used today`;
      case 'send_email':
        if (subscriptionInfo?.plan === 'FREE') {
          return `${currentUsage.emailsSent || 0}/${limits.emailsPerDay || 0} emails sent today`;
        } else {
          return `${currentUsage.monthlyEmailsSent || 0}/${limits.emailsPerMonth || 0} emails sent this month`;
        }
      case 'add_investor':
        if (subscriptionInfo?.plan === 'FREE') {
          return `${currentUsage.investorsAdded || 0}/${limits.investorsPerDay || 0} investors added today`;
        } else {
          return `${currentUsage.monthlyInvestorsAdded || 0}/${limits.investorsPerMonth || 0} investors added this month`;
        }
      case 'download_csv':
        return `CSV downloads are not available on your current plan.`;
      default:
        return '';
    }
  };

  const getUpgradeMessage = () => {
    if (subscriptionInfo?.plan === 'FREE') {
      return 'Upgrade to Starter, Pro, or Scale to increase your limits and access additional features.';
    }else if (subscriptionInfo?.plan === 'STARTER') {
      return 'Upgrade to Pro or Scale for even higher limits and premium features.';
    }
    else if (subscriptionInfo?.plan === 'PRO') {
      return 'Upgrade to Scale for even higher limits and premium features.';
    }
    return 'Contact support to discuss custom limits.';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Subscription Limit Reached
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            You've reached your limit for <strong>{getActionText()}</strong>.
          </p>
          <p className="text-sm text-gray-500">
            {getLimitText()}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {getUpgradeMessage()}
          </p>
          
          <div className="space-y-3">
            {subscriptionInfo?.plan === 'FREE' && (
              <>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Starter - $69/month</h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">STARTER</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add 125 investors to CRM per month</li>
                    <li>• Send up to 125 emails/month</li>
                    <li>• AI drafts: up to 125/month</li>
                    <li>• Full contact information</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Pro - $99/month</h3>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">BEST VALUE</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add 500 investors to CRM per month</li>
                    <li>• Send up to 500 emails/month</li>
                    <li>• AI drafts: up to 500/month</li>
                    <li>• Full contact information</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Scale - $179/month</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">EXLUSIVE</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add 1000 investors to CRM per month</li>
                    <li>• Send up to 1000 emails/month</li>
                    <li>• AI drafts: up to 1000/month</li>
                    <li>• All Pro features</li>
                  </ul>
                </div>
              </>
            )}
            
            {subscriptionInfo?.plan === 'STARTER' && (
              <>
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Pro - $99/month</h3>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">BEST VALUE</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add 500 investors to CRM per month</li>
                    <li>• Send up to 500 emails/month</li>
                    <li>• AI drafts: up to 500/month</li>
                    <li>• Full contact information</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Scale - $179/month</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">EXLUSIVE</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add 1000 investors to CRM per month</li>
                    <li>• Send up to 1000 emails/month</li>
                    <li>• AI drafts: up to 1000/month</li>
                    <li>• All Scale features</li>
                  </ul>
                </div>
              </>
            )}

            {subscriptionInfo?.plan === 'PRO' && (
              <>
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Scale - $179/month</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">EXLUSIVE</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add 1000 investors to CRM per month</li>
                    <li>• Send up to 1000 emails/month</li>
                    <li>• AI drafts: up to 1000/month</li>
                    <li>• All Scale features</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              // Redirect to subscription page
              window.location.href = '/subscription';
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
