export interface SignatureData {
  displayName?: string;
  email?: string;
  position?: string;
  companyName?: string;
  logoUrl?: string;
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
];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildSignatureHtml = (data: SignatureData): string | null => {
  const displayName = data.displayName?.trim() || '';
  const position = data.position?.trim() || '';
  const companyName = data.companyName?.trim() || '';
  const email = data.email?.trim() || '';
  const logoUrl = data.logoUrl?.trim() || '';

  const signatureLines: string[] = [];

  if (logoUrl) {
    const safeLogoUrl = logoUrl.replace(/"/g, '&quot;');
    const altText = escapeHtml(companyName || 'Company logo');
    signatureLines.push(
      `<p style="margin:0;"><img src="${safeLogoUrl}" alt="${altText}" style="height:32px; max-height:32px; width:auto; max-width:160px; object-fit:contain;" /></p>`,
    );
  }

  if (displayName) {
    signatureLines.push(
      `<p style="margin:0;font-weight:600;color:#0C2143;">${escapeHtml(displayName)}</p>`,
    );
  }

  if (position) {
    signatureLines.push(`<p style="margin:0;color:#0C2143;">${escapeHtml(position)}</p>`);
  }

  if (companyName) {
    signatureLines.push(`<p style="margin:0;color:#0C2143;">${escapeHtml(companyName)}</p>`);
  }

  if (email) {
    const safeEmail = escapeHtml(email);
    signatureLines.push(
      `<p style="margin:0;color:#0C2143;"><a href="mailto:${safeEmail}" style="color:#2563EB;text-decoration:none;">${safeEmail}</a></p>`,
    );
  }

  if (!signatureLines.length) {
    return null;
  }

  return `<div data-user-signature="true" style="margin-top:24px;">${signatureLines.join('')}</div>`;
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

  if (!hasClosing) {
    cleanedContent += '<p style="margin:0 0 12px 0;">Best regards,</p>';
  }

  if (cleanedContent && !/<p>\s*<br\s*\/?>(\s*<\/p>)?\s*$/i.test(cleanedContent)) {
    cleanedContent += '<p><br></p>';
  }

  return `${cleanedContent}${signatureHtml}`;
};
