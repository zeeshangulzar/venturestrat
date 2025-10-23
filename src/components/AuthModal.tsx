'use client';

import React, { useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { hasVerifiedExternalAccount } from '../utils/externalAccounts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  onSkipAuth?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, onSkipAuth }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<'google' | 'microsoft' | null>(null);
  const [showSuccess, setShowSuccess] = useState<'google' | 'microsoft' | null>(null);

  const hasGoogleAccount = useMemo(
    () => hasVerifiedExternalAccount(user?.externalAccounts, 'google'),
    [user?.externalAccounts],
  );

  const hasMicrosoftAccount = useMemo(
    () => hasVerifiedExternalAccount(user?.externalAccounts, 'microsoft'),
    [user?.externalAccounts],
  );

  const hasAnyAccount = hasGoogleAccount || hasMicrosoftAccount;

  if (!isOpen) return null;

  const buildRedirectConfig = () => {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      redirectUrl: window.location.origin,
      actionCompleteRedirectUrl: window.location.href,
    };
  };

  const handleGoogleAuth = async () => {
    if (!user) return;

    if (hasMicrosoftAccount) {
      alert('You already have a Microsoft account connected. You can only have one account at a time.');
      return;
    }

    setIsLoading('google');
    try {
      const externalAccount = await user.createExternalAccount({
        strategy: 'oauth_google',
        additionalScopes: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.readonly',
          'openid',
          'email',
          'profile',
        ],
        // Use popup instead of redirect to avoid AuthFlowManager interference
        redirectUrl: window.location.origin,
      });

      const verificationUrl = externalAccount.verification?.externalVerificationRedirectURL;
      if (verificationUrl) {
        // Open in popup window instead of redirecting current page
        const popup = window.open(
          verificationUrl.toString(),
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes,location=yes,toolbar=no'
        );

        // Focus the popup and close the AuthModal
        if (popup) {
          popup.focus();
          // Keep AuthModal open to show success state
        }

        // Listen for popup completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Reload user and check connection
            user.reload().then(() => {
              const connected = hasVerifiedExternalAccount(user.externalAccounts, 'google');
              if (connected) {
                // Close the popup if it's still open
                if (popup && !popup.closed) {
                  popup.close();
                }
                // Show success message after popup closes
                setTimeout(() => {
                  setShowSuccess('google');
                  setTimeout(() => {
                    setShowSuccess(null);
                    onClose(); // Close the modal after showing success
                    onAuthSuccess();
                  }, 3000); // Show success for 3 seconds
                }, 500); // Small delay to ensure popup is closed
              } else {
                alert('Google account connection was not completed. Please try again.');
              }
              setIsLoading(null);
            });
          }
        }, 1000);

        // Also listen for successful authentication in the popup
        const checkSuccess = setInterval(() => {
          try {
            // Check if popup has navigated to success page or back to our domain
            if (popup && !popup.closed) {
              const popupUrl = popup.location.href;
              if (popupUrl.includes('success') || 
                  popupUrl.includes(window.location.origin) ||
                  popupUrl.includes('localhost:3000')) {
                clearInterval(checkSuccess);
                clearInterval(checkClosed);
                popup.close();
              user.reload().then(() => {
                const connected = hasVerifiedExternalAccount(user.externalAccounts, 'google');
                if (connected) {
                  // Show success message after popup closes
                  setTimeout(() => {
                    setShowSuccess('google');
                    setTimeout(() => {
                      setShowSuccess(null);
                      onClose(); // Close the modal after showing success
                      onAuthSuccess();
                    }, 3000); // Show success for 3 seconds
                  }, 500); // Small delay to ensure popup is closed
                } else {
                  alert('Google account connection was not completed. Please try again.');
                }
                setIsLoading(null);
              });
              }
            }
          } catch (e) {
            // Cross-origin error, ignore
          }
        }, 1000);

        // Auto-close popup after 2 minutes to prevent it from staying open
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
            clearInterval(checkClosed);
            clearInterval(checkSuccess);
            setIsLoading(null);
          }
        }, 120000); // 2 minutes

        return;
      }

      await user.reload();
      const connected = hasVerifiedExternalAccount(user.externalAccounts, 'google');
      if (connected) {
        onAuthSuccess();
      } else {
        alert('Google account connection was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert('Unable to connect your Google account. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleMicrosoftAuth = async () => {
    if (!user) return;

    if (hasGoogleAccount) {
      alert('You already have a Google account connected. You can only have one account at a time.');
      return;
    }

    setIsLoading('microsoft');
    try {
      const externalAccount = await user.createExternalAccount({
        strategy: 'oauth_microsoft',
        additionalScopes: [
          'https://graph.microsoft.com/Mail.Send',
          'https://graph.microsoft.com/Mail.Read',
          'offline_access',
        ],
        // Use popup instead of redirect to avoid AuthFlowManager interference
        redirectUrl: window.location.origin,
      });

      const verificationUrl = externalAccount.verification?.externalVerificationRedirectURL;
      if (verificationUrl) {
        // Open in popup window instead of redirecting current page
        const popup = window.open(
          verificationUrl.toString(),
          'microsoft-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes,location=yes,toolbar=no'
        );

        // Focus the popup and close the AuthModal
        if (popup) {
          popup.focus();
          // Keep AuthModal open to show success state
        }

        // Listen for popup completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Reload user and check connection
            user.reload().then(() => {
              const connected = hasVerifiedExternalAccount(user.externalAccounts, 'microsoft');
              if (connected) {
                // Close the popup if it's still open
                if (popup && !popup.closed) {
                  popup.close();
                }
                // Show success message after popup closes
                setTimeout(() => {
                  setShowSuccess('microsoft');
                  setTimeout(() => {
                    setShowSuccess(null);
                    onClose(); // Close the modal after showing success
                    onAuthSuccess();
                  }, 3000); // Show success for 3 seconds
                }, 500); // Small delay to ensure popup is closed
              } else {
                alert('Microsoft account connection was not completed. Please try again.');
              }
              setIsLoading(null);
            });
          }
        }, 1000);

        // Also listen for successful authentication in the popup
        const checkSuccess = setInterval(() => {
          try {
            // Check if popup has navigated to success page or back to our domain
            if (popup && !popup.closed) {
              const popupUrl = popup.location.href;
              if (popupUrl.includes('success') || 
                  popupUrl.includes(window.location.origin) ||
                  popupUrl.includes('localhost:3000')) {
                clearInterval(checkSuccess);
                clearInterval(checkClosed);
                popup.close();
                user.reload().then(() => {
                  const connected = hasVerifiedExternalAccount(user.externalAccounts, 'microsoft');
                  if (connected) {
                    // Show success message after popup closes
                    setTimeout(() => {
                      setShowSuccess('microsoft');
                      setTimeout(() => {
                        setShowSuccess(null);
                        onClose(); // Close the modal after showing success
                        onAuthSuccess();
                      }, 3000); // Show success for 3 seconds
                    }, 500); // Small delay to ensure popup is closed
                  } else {
                    alert('Microsoft account connection was not completed. Please try again.');
                  }
                  setIsLoading(null);
                });
              }
            }
          } catch (e) {
            // Cross-origin error, ignore
          }
        }, 1000);

        // Auto-close popup after 2 minutes to prevent it from staying open
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
            clearInterval(checkClosed);
            clearInterval(checkSuccess);
            setIsLoading(null);
          }
        }, 120000); // 2 minutes

        return;
      }

      await user.reload();
      const connected = hasVerifiedExternalAccount(user.externalAccounts, 'microsoft');
      if (connected) {
        onAuthSuccess();
      } else {
        alert('Microsoft account connection was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Microsoft authentication failed:', error);
      alert('Unable to connect your Microsoft account. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect Email Account
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
        
        <div className="mb-6">
          {showSuccess ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">
                {showSuccess === 'google' ? 'Google account connected successfully!' : 'Microsoft account connected successfully!'}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                You can now send emails using your connected account.
              </p>
            </div>
          ) : hasAnyAccount ? (
            <>
              <p className="text-gray-600 text-sm">
                You already have an account connected for sending emails.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {hasGoogleAccount && 'Google account is connected.'}
                {hasMicrosoftAccount && 'Microsoft account is connected.'}
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm">
                For sending emails on your behalf, please connect an account.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                You can only connect one account (Google or Microsoft).
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          {/* Google Authentication Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading !== null || hasGoogleAccount}
            className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
              hasGoogleAccount 
                ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed' 
                : isLoading === 'google' 
                  ? 'border-gray-300 opacity-50 cursor-not-allowed' 
                  : isLoading === 'microsoft'
                    ? 'border-gray-300 opacity-50 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isLoading === 'google' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                Connecting...
              </div>
            ) : hasGoogleAccount ? (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                ✓ Google Connected
              </div>
            ) : isLoading === 'microsoft' ? (
              <div className="flex items-center opacity-50">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect with Google
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect with Google
              </div>
            )}
          </button>

          {/* Microsoft Authentication Button */}
          <button
            onClick={handleMicrosoftAuth}
            disabled={isLoading !== null || hasMicrosoftAccount}
            className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
              hasMicrosoftAccount 
                ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed' 
                : isLoading === 'microsoft' 
                  ? 'border-gray-300 opacity-50 cursor-not-allowed' 
                  : isLoading === 'google'
                    ? 'border-gray-300 opacity-50 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isLoading === 'microsoft' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                Connecting...
              </div>
            ) : hasMicrosoftAccount ? (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                ✓ Microsoft Connected
              </div>
            ) : isLoading === 'google' ? (
              <div className="flex items-center opacity-50">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Connect with Microsoft
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Connect with Microsoft
              </div>
            )}
          </button>
        </div>

        {/* OK Button for skipping authentication */}
        {onSkipAuth && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onSkipAuth}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              OK - Send without authentication
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {hasAnyAccount 
              ? 'You can only have one connected account at a time.'
              : 'You can only connect one account (Google or Microsoft).'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
