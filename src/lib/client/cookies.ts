'use client';

export function getCookieValue(name: string) {
  if (typeof document === 'undefined') return '';
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.slice(encodedName.length));
    }
  }
  return '';
}
