import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchUserData } from '@lib/api';

export interface SignatureData {
  displayName?: string;
  email?: string;
  position?: string;
  companyName?: string;
  logoUrl?: string;
  companyUrl?: string;
  location?: string;
}

export const SIGNATURE_REGEX = /<div[^>]+data-user-signature="true"[^>]*>[\s\S]*?<\/div>/i;
const SIGNATURE_GLOBAL_REGEX = /<div[^>]+data-user-signature="true"[^>]*>[\s\S]*?<\/div>/gi;
const SIGNATURE_CLOSINGS = [
  'best regards',
  'kind regards',
  'regards,',
  'regards',
  'sincerely',
  'thank you',
  'thanks',
  'Appreciate your time',
  'Best Regards',
];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value: string): string => value.replace(/"/g, '&quot;');

const formatUrl = (url?: string | null) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const href = escapeAttribute(withProtocol);
  const label = escapeHtml(trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, '') || trimmed);
  return { href, label };
};

export const buildSignatureHtml = (data: SignatureData): string | null => {
  const displayName = data.displayName?.trim() || '';
  const position = data.position?.trim() || '';
  const companyName = data.companyName?.trim() || '';
  const email = data.email?.trim() || '';
  const logoUrl = data.logoUrl?.trim() || '';
  const companyUrl = data.companyUrl?.trim() || '';
  const location = data.location?.trim() || '';

  if (!displayName && !position && !companyName && !email && !logoUrl && !companyUrl && !location) {
    return null;
  }

  const safeLogoUrl = logoUrl ? escapeAttribute(logoUrl) : '';
  const altText = escapeHtml(companyName || displayName || 'Company logo');
  const logoMarkup = safeLogoUrl
  ? `<img src="${safeLogoUrl}" alt="${altText}" width="70" style="display:block;width:70px;height:auto;" />`
  : '';
  const titleLine = displayName
    ? `<p style="margin:0;font-weight:700;font-size:16px;color:#646464;">${escapeHtml(displayName)}</p>`
    : '';

  const roleCompanyLine =
    position || companyName
      ? `<p style="margin:0;color:#646464;font-size:14px;font-weight:700;">${[position, companyName]
          .filter(Boolean)
          .map((value) => escapeHtml(value!))
          .join(', ')}</p>`
      : '';

  const formattedUrl = formatUrl(companyUrl);

  const contactSegments: string[] = [];
  if (formattedUrl) {
    contactSegments.push(
      `<span style="color:#222222;text-decoration:none;">${formattedUrl.href}</span>`,
    );
  }

  if (email) {
    const safeEmail = escapeAttribute(email);
    contactSegments.push(
      `<span style="color:#222222;text-decoration:none;">${escapeHtml(email)}</span>`,
    );
  }

  const divider = '<span style="margin:0 8px;color:#222222;">|</span>';
  const contactLine = contactSegments.length
    ? `<p style="margin:0 0 8px 0;color:#1F2933;">${contactSegments.join(divider)}</p>`
    : '';

  const locationLine = location
    ? `<p style="margin:0;color:#374151;">${escapeHtml(location)}</p>`
    : '';

  return `<div data-user-signature="true" style="margin-top:24px;">
    <table style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
      <tbody>
        <tr>
          ${safeLogoUrl
        ? `<td data-signature-logo-cell="true" style="outline: none; padding-right:16px;border-right:2px solid #BDBDBD;" contenteditable="true">
             ${logoMarkup}
           </td>
           <td style="padding-left:20px;vertical-align:top; outline: none;" contenteditable="true" data-signature-logo-right-cell="true">
            ${titleLine}
            ${roleCompanyLine}
            ${contactLine}
            ${locationLine}</td>`
        : `<td style="outline: none; vertical-align:top;" contenteditable="true">
            ${titleLine}
            ${roleCompanyLine}
            ${contactLine}
            ${locationLine}</td>`}
        </tr>
      </tbody>
    </table>
  </div>`;
};

export const appendSignatureToBody = (
  content: string,
  signatureHtml: string | null,
): string => {
  if (!signatureHtml) {
    return content;
  }

  let cleanedContent = (content || '').replace(SIGNATURE_GLOBAL_REGEX, '').trim();
  const normalized = cleanedContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const hasClosing = SIGNATURE_CLOSINGS.some(
    (phrase) => normalized.endsWith(phrase) || normalized.includes(`${phrase}.`),
  );

  if (cleanedContent && !/<p>\s*<br\s*\/?>(\s*<\/p>)?\s*$/i.test(cleanedContent)) {
    cleanedContent += '<p><br></p>';
  }

  return `${cleanedContent}${signatureHtml}`;
};

type RawUser = Record<string, unknown> | null | undefined;

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const pickFirstString = (...values: unknown[]): string =>
  values.map(normalizeString).find((value) => value.length > 0) || '';

const buildLocation = (...segments: unknown[]): string =>
  segments
    .map(normalizeString)
    .filter((value) => value.length > 0)
    .join(', ');

export interface SignatureSourceOptions {
  clerkUser?: {
    firstName?: string | null;
    lastName?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
    imageUrl?: string;
    publicMetadata?: Record<string, unknown>;
  } | null;
  backendUser?: RawUser;
  fallbackCompany?: {
    name?: string;
    logo?: string;
    website?: string;
    location?: string;
    position?: string;
  };
}

export const buildSignatureData = ({
  clerkUser,
  backendUser,
  fallbackCompany,
}: SignatureSourceOptions): SignatureData => {
  const backendRecord = (backendUser || {}) as Record<string, unknown>;
  const backendPublic = (backendRecord.publicMetaData || {}) as Record<string, unknown>;
  const clerkPublic = (clerkUser?.publicMetadata || {}) as Record<string, unknown>;

  const backendFirstName = normalizeString(backendRecord.firstname);
  const backendLastName = normalizeString(backendRecord.lastname);

  const displayName = pickFirstString(
    [backendFirstName, backendLastName].filter(Boolean).join(' '),
    backendRecord.email,
    clerkUser?.emailAddresses?.[0]?.emailAddress,
  );

  const email = pickFirstString(
    backendRecord.email,
    clerkUser?.emailAddresses?.[0]?.emailAddress,
  );

  const position = pickFirstString(
    backendPublic.position,
  );

  const companyName = pickFirstString(
    backendPublic.companyName,
  );

  const logoUrl = pickFirstString(
    backendRecord.companyLogo
  );

  const companyUrl = pickFirstString(
    backendRecord.companyWebsite,
  );


  const location = buildLocation(
    '',
  );

  return {
    displayName,
    email,
    position,
    companyName,
    logoUrl,
    companyUrl,
    location,
  };
};

interface SignatureHookResult {
  signatureData: SignatureData | null;
  signatureHtml: string | null;
  loading: boolean;
}

export const useSignature = (): SignatureHookResult => {
  const { user } = useUser();
  const [backendUser, setBackendUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      if (!user?.id) {
        if (isMounted) {
          setBackendUser(null);
        }
        return;
      }
      setLoading(true);
      try {
        const data = await fetchUserData(user.id);
        if (!isMounted) return;
        const actual =
          data && typeof data === 'object' && 'user' in (data as Record<string, unknown>)
            ? ((data as { user?: Record<string, unknown> }).user ?? data)
            : data;
        setBackendUser(actual as Record<string, unknown> | null);
      } catch (error) {
        console.error('Failed to fetch backend user data for signature:', error);
        if (isMounted) {
          setBackendUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const signatureData = useMemo(() => {
    if (!user) return null;
    return buildSignatureData({
      clerkUser: user,
      backendUser,
      fallbackCompany: undefined,
    });
  }, [user, backendUser]);

  const signatureHtml = useMemo(
    () => (signatureData ? buildSignatureHtml(signatureData) : null),
    [signatureData],
  );

  return { signatureData, signatureHtml, loading };
};
