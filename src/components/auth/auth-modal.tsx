'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordRequirements, passwordMeetsAllRules } from '@/components/auth/password-rules';
import { OtpInputs } from '@/components/auth/otp-inputs';
import {
  getOAuthCallbackNextPath,
  navigateAfterAuth,
} from '@/lib/post-auth-navigation';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

const EXISTING_EMAIL_MESSAGE = 'This email is already in use. Please Sign In.';

function isLikelyExistingUserFromSignUp(data: {
  user: import('@supabase/supabase-js').User | null;
}): boolean {
  if (!data.user) {
    return true;
  }
  const ids = data.user.identities;
  if (Array.isArray(ids) && ids.length === 0) {
    return true;
  }
  return false;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  urlError?: string | null;
  redirectAfterLogin?: string | null;
};

export function AuthModal({
  open,
  onClose,
  initialMode,
  urlError,
  redirectAfterLogin = null,
}: AuthModalProps) {
  const supabase = useMemo(() => createClient(), []);

  const [panel, setPanel] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const resetForm = useCallback(() => {
    setPassword('');
    setOtp('');
    setTermsAccepted(false);
    setAwaitingVerification(false);
    setError(null);
    setToast(null);
    setLoadingSignIn(false);
    setLoadingSignUp(false);
    setLoadingVerify(false);
    setLoadingGoogle(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setPanel(initialMode);
      resetForm();
      setEmail('');
      setFullName('');
    });
  }, [open, initialMode, resetForm]);

  useEffect(() => {
    if (!open || !urlError) return;
    queueMicrotask(() => setError(urlError));
  }, [open, urlError]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => {
    setToast(msg);
  };

  const switchToSignIn = () => {
    setPanel('signin');
    setAwaitingVerification(false);
    setOtp('');
    setError(null);
    setTermsAccepted(false);
  };

  const switchToForgot = () => {
    setPanel('forgot');
    setError(null);
  };

  const switchToSignUp = () => {
    setPanel('signup');
    setAwaitingVerification(false);
    setOtp('');
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSignIn(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoadingSignIn(false);
      return;
    }

    navigateAfterAuth(redirectAfterLogin);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMeetsAllRules(password) || !termsAccepted) return;

    setLoadingSignUp(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes('already') || msg.includes('registered') || signUpError.status === 422) {
        setError(EXISTING_EMAIL_MESSAGE);
      } else {
        setError(signUpError.message);
      }
      setLoadingSignUp(false);
      return;
    }

    if (isLikelyExistingUserFromSignUp(data)) {
      setError(EXISTING_EMAIL_MESSAGE);
      setLoadingSignUp(false);
      return;
    }

    if (data.session) {
      navigateAfterAuth(redirectAfterLogin);
      return;
    }

    setAwaitingVerification(true);
    setLoadingSignUp(false);
    showToast('Check your email for a 6-digit code.');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the full 6-digit code.');
      return;
    }

    setLoadingVerify(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoadingVerify(false);
      return;
    }

    showToast('Email verified. Welcome!');
    navigateAfterAuth(redirectAfterLogin);
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    setError(null);
    const nextPath = getOAuthCallbackNextPath(redirectAfterLogin);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoadingGoogle(false);
    }
  };

  const signUpPasswordOk = passwordMeetsAllRules(password);
  const signUpDisabled =
    loadingSignUp || !signUpPasswordOk || !termsAccepted || !email.trim();

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-[201] w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-black/15"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#0A0A0A]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {toast && (
          <div
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-800"
            role="status"
          >
            {toast}
          </div>
        )}

        {error && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {awaitingVerification ? (
          <>
            <div className="pr-10 text-center">
              <h2 id="auth-modal-title" className="font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
                Verify your email
              </h2>
              <p className="mt-2 text-sm text-[#888888]">
                Check your email for a 6-digit code sent to <span className="font-medium text-[#0A0A0A]">{email}</span>
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <OtpInputs value={otp} onChange={setOtp} disabled={loadingVerify} />

              <button
                type="submit"
                disabled={loadingVerify || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-medium text-white shadow-xl shadow-black/5 transition-colors hover:bg-black/80 disabled:opacity-50"
              >
                {loadingVerify ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loadingVerify ? 'Verifying…' : 'Verify & continue'}
              </button>

              <p className="text-center text-sm text-[#888888]">
                Wrong email?{' '}
                <button
                  type="button"
                  className="font-medium text-[#0A0A0A] underline-offset-2 hover:underline"
                  onClick={() => {
                    setAwaitingVerification(false);
                    setOtp('');
                    setError(null);
                  }}
                >
                  Go back
                </button>
              </p>
            </form>
          </>
        ) : panel === 'forgot' ? (
          <>
            <div className="pr-10 text-center">
              <h2 id="auth-modal-title" className="font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
                Lupa password
              </h2>
              <p className="mt-2 text-sm text-[#888888]">
                Masukkan email akunmu. Kami kirim link untuk atur ulang password.
              </p>
            </div>
            <div className="mt-6">
              <ForgotPasswordForm onBack={switchToSignIn} backLabel="Kembali ke masuk" />
            </div>
          </>
        ) : panel === 'signin' ? (
          <>
            <div className="pr-10 text-center">
              <h2 id="auth-modal-title" className="font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[#888888]">Sign in to your account</p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSignIn}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#0A0A0A]">Password</label>
                  <button
                    type="button"
                    onClick={switchToForgot}
                    className="text-sm font-medium text-[#888888] transition-colors hover:text-[#0A0A0A]"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingSignIn}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-medium text-white shadow-xl shadow-black/5 transition-colors hover:bg-black/80 disabled:opacity-50"
              >
                {loadingSignIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loadingSignIn ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">or</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loadingGoogle || loadingSignIn}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Google
            </button>

            <p className="mt-8 text-center text-sm text-[#888888]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={switchToSignUp}
                className="font-medium text-[#0A0A0A] hover:underline"
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="pr-10 text-center">
              <h2 id="auth-modal-title" className="font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-[#888888]">Start generating icons in seconds.</p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSignUp}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                  />
                </div>
                <PasswordRequirements password={password} />
              </div>

              <label className="flex cursor-pointer items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-[#0A0A0A] focus:ring-[#0A0A0A]"
                />
                <span className="text-sm leading-snug text-[#888888]">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-[#0A0A0A] underline-offset-2 hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-[#0A0A0A] underline-offset-2 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={signUpDisabled}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-medium text-white shadow-xl shadow-black/5 transition-colors hover:bg-black/80 disabled:opacity-50"
              >
                {loadingSignUp ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loadingSignUp ? 'Creating account…' : 'Sign up'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loadingGoogle || loadingSignUp}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Sign up with Google
            </button>

            <p className="mt-8 text-center text-sm text-[#888888]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchToSignIn}
                className="font-medium text-[#0A0A0A] hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
