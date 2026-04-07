'use client';

import { createContext, useContext } from 'react';

export type AuthModalMode = 'signin' | 'signup';

export type OpenAuthOptions = {
  /** After sign-in, navigate here (must be an internal path starting with /). */
  next?: string | null;
};

type AuthModalContextValue = {
  openAuth: (mode: AuthModalMode, options?: OpenAuthOptions) => void;
  closeAuth: () => void;
};

export const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
}
