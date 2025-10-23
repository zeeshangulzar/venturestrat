export type OAuthProviderKey = 'google' | 'microsoft';

const NORMALIZED_PROVIDER_ALIAS: Record<OAuthProviderKey, string[]> = {
  google: ['google', 'oauth_google'],
  microsoft: ['microsoft', 'oauth_microsoft'],
};

const VERIFIED_STATUSES = new Set<string>(['verified', 'transferable']);

const matchesProvider = (
  account: any,
  provider: OAuthProviderKey,
): boolean => {
  const aliases = NORMALIZED_PROVIDER_ALIAS[provider];
  const providerId = account.provider;

  return aliases.some(alias => providerId === alias || providerId?.includes(alias));
};

const isVerificationComplete = (account: any): boolean => {
  const verificationStatus = account.verification?.status ?? null;

  if (verificationStatus && VERIFIED_STATUSES.has(verificationStatus)) {
    return true;
  }

  const approvedScopes =
    typeof account.approvedScopes === 'string'
      ? account.approvedScopes.trim()
      : '';

  return verificationStatus === null && approvedScopes.length > 0;
};

export const isExternalAccountVerified = (
  account: any,
  provider: OAuthProviderKey,
): boolean => {
  if (!matchesProvider(account, provider)) {
    return false;
  }

  return isVerificationComplete(account);
};

export const hasVerifiedExternalAccount = (
  accounts: any[] | null | undefined,
  provider: OAuthProviderKey,
): boolean => {
  return (
    Array.isArray(accounts) &&
    accounts.some(account => isExternalAccountVerified(account, provider))
  );
};
