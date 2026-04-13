'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AuthModalContext,
  type AuthModalMode,
  type OpenAuthOptions,
} from '@/components/auth/auth-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { sanitizeNextPath } from '@/lib/safe-redirect';

function AuthSearchParamsSync({
  onUrlError,
  onAuthGate,
  onOAuthErrorOpen,
}: {
  onUrlError: (message: string | null) => void;
  onAuthGate: (nextPath: string) => void;
  onOAuthErrorOpen: () => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      if (pathname === '/' && searchParams.get('error')) {
        const ec = searchParams.get('error_code') || '';
        const ed = decodeURIComponent(searchParams.get('error_description') || '').toLowerCase();
        const isEmailLinkIssue =
          ec === 'otp_expired' ||
          ed.includes('email link') ||
          ed.includes('invalid or has expired') ||
          ed.includes('link is invalid');
        if (isEmailLinkIssue) {
          router.replace('/forgot-password?reason=link_expired');
          return;
        }
      }

      if (searchParams.get('error') === 'auth') {
        onUrlError('Sign-in failed. Please try again.');
        onOAuthErrorOpen();
        router.replace(pathname || '/');
      }

      if (searchParams.get('auth') === '1') {
        const raw = searchParams.get('next');
        const nextPath = sanitizeNextPath(raw, '/app');
        onAuthGate(nextPath);
        router.replace(pathname || '/');
      }
    });
  }, [searchParams, pathname, router, onUrlError, onAuthGate, onOAuthErrorOpen]);

  // Error Supabase di hash (#error=…) tidak terbaca middleware — tangani di klien.
  useEffect(() => {
    if (pathname !== '/' && pathname !== '') return;
    if (typeof window === 'undefined') return;
    const raw = window.location.hash?.replace(/^#/, '') ?? '';
    if (!raw.includes('error')) return;
    const hp = new URLSearchParams(raw);
    const errorCode = hp.get('error_code') || '';
    const desc = decodeURIComponent(hp.get('error_description') || '').toLowerCase();
    const isEmailLinkIssue =
      errorCode === 'otp_expired' ||
      desc.includes('email link') ||
      desc.includes('invalid or has expired') ||
      desc.includes('link is invalid');
    if (!isEmailLinkIssue) return;
    router.replace('/forgot-password?reason=link_expired');
    window.history.replaceState(null, '', '/');
  }, [pathname, router]);

  return null;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const onAuthRoute = pathname === '/login' || pathname === '/signup';
  const modeFromPath: AuthModalMode = pathname === '/signup' ? 'signup' : 'signin';

  const [userOpened, setUserOpened] = useState(false);
  const [userMode, setUserMode] = useState<AuthModalMode>('signin');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [authRouteDismissed, setAuthRouteDismissed] = useState(false);
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => setAuthRouteDismissed(false));
  }, [pathname]);

  const modalOpen = (onAuthRoute && !authRouteDismissed) || userOpened;
  const initialMode = onAuthRoute ? modeFromPath : userMode;

  const openAuth = useCallback((mode: AuthModalMode, options?: OpenAuthOptions) => {
    setUserMode(mode);
    setUserOpened(true);
    if (options && 'next' in options) {
      setPostAuthRedirect(options.next != null ? sanitizeNextPath(options.next, '/app') : null);
    } else {
      setPostAuthRedirect(null);
    }
  }, []);

  const onAuthGate = useCallback((nextPath: string) => {
    setPostAuthRedirect(nextPath);
    setUserMode('signin');
    setUserOpened(true);
  }, []);

  const onOAuthErrorOpen = useCallback(() => {
    setUserMode('signin');
    setUserOpened(true);
  }, []);

  const closeAuth = useCallback(() => {
    setUserOpened(false);
    setUrlError(null);
    setPostAuthRedirect(null);
    if (onAuthRoute) {
      setAuthRouteDismissed(true);
      router.replace('/');
    }
  }, [onAuthRoute, router]);

  const setUrlErrorStable = useCallback((msg: string | null) => {
    setUrlError(msg);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      <Suspense fallback={null}>
        <AuthSearchParamsSync
          onUrlError={setUrlErrorStable}
          onAuthGate={onAuthGate}
          onOAuthErrorOpen={onOAuthErrorOpen}
        />
      </Suspense>
      {children}
      <AuthModal
        open={modalOpen}
        onClose={closeAuth}
        initialMode={initialMode}
        urlError={urlError}
        redirectAfterLogin={postAuthRedirect}
      />
    </AuthModalContext.Provider>
  );
}
