import { sanitizeNextPath } from '@/lib/safe-redirect';
import { PRICING_CHECKOUT_STORAGE_KEY } from '@/lib/pricing-checkout';

export function navigateAfterAuth(redirectAfterLogin: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage.getItem(PRICING_CHECKOUT_STORAGE_KEY)) {
      window.location.href = '/pricing';
      return;
    }
  } catch {
    /* sessionStorage blocked */
  }
  window.location.href = sanitizeNextPath(redirectAfterLogin, '/app');
}

/** Target path for OAuth callback `next` query (server redirect after code exchange). */
export function getOAuthCallbackNextPath(redirectAfterLogin: string | null): string {
  if (typeof window === 'undefined') {
    return sanitizeNextPath(redirectAfterLogin, '/app');
  }
  try {
    if (window.sessionStorage.getItem(PRICING_CHECKOUT_STORAGE_KEY)) {
      return '/pricing';
    }
  } catch {
    /* ignore */
  }
  return sanitizeNextPath(redirectAfterLogin, '/app');
}
