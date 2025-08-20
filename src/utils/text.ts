// utils/text.ts
export function cleanDisplayName(input?: string | null): string {
  if (!input) return '';
  let s = input;

  // 1) drop Unicode replacement chars
  s = s.replace(/\uFFFD/g, '');

  // 2) NFC normalize (merges combining marks properly)
  s = s.normalize('NFC');

  // 3) Try to repair classic latin1→utf8 mojibake (e.g., "Ãrni BlÃ¶ndal")
  if (/[ÃÂ]/.test(s)) {
    try {
      const bytes = new Uint8Array([...s].map(ch => ch.charCodeAt(0) & 0xff));
      s = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      s = s.normalize('NFC');
    } catch {
      // if it isn't valid UTF-8 bytes, keep original
    }
  }

  // 4) Remove stray control chars (keep tab/newline if you like)
  s = s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');

  return s.trim();
}
