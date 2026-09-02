import { isAddress } from 'viem';

const LS_KEY = 'blaze_ref';
const COOKIE_KEY = 'blaze_ref';

export function normalizeAddress(addr) {
  if (!addr || typeof addr !== 'string') return null;
  const t = addr.trim();
  return isAddress(t) ? t.toLowerCase() : null;
}

export function getReferrer() {
  if (typeof window === 'undefined') return null;
  try {
    const ls = localStorage.getItem(LS_KEY);
    const n = normalizeAddress(ls);
    if (n) return n;
    const m = document.cookie.match(new RegExp(`${COOKIE_KEY}=([^;]+)`));
    if (m) return normalizeAddress(decodeURIComponent(m[1]));
  } catch {}
  return null;
}

export function setReferrer(addr) {
  const n = normalizeAddress(addr);
  if (!n) return;
  try {
    localStorage.setItem(LS_KEY, n);
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(n)}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {}
}

export function clearReferrer() {
  try {
    localStorage.removeItem(LS_KEY);
    document.cookie = `${COOKIE_KEY}=; max-age=0; path=/`;
  } catch {}
}

// Call on landing: capture ?ref=0x... or ?r=0x...; ignore self referrals later at API layer as well
export function captureReferrerFromUrl({ searchParams } = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const sp = searchParams || new URLSearchParams(window.location.search);
    const raw = sp.get('ref') || sp.get('r');
    const n = normalizeAddress(raw);
    if (n) {
      // don't overwrite existing if already set (first ref wins → forever valid)
      if (!getReferrer()) setReferrer(n);
      return n;
    }
  } catch {}
  return null;
}
