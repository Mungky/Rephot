"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setSessionToken(session.access_token ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memeriksa session."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        setUser(data.user);
      }
      if (data.session) {
        setSessionToken(data.session.access_token);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login gagal. Coba lagi.";
      setError(message);
      alert(`Login gagal: ${message}`);
    }
  };

  const handleSignOut = async () => {
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setUser(null);
      setSessionToken(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Logout gagal. Coba lagi.";
      setError(message);
      alert(`Logout gagal: ${message}`);
    }
  };

  const handleCopyToken = async () => {
    if (!sessionToken) return;

    try {
      await navigator.clipboard.writeText(sessionToken);
      alert("Token disalin ke clipboard.");
    } catch {
      const message = "Gagal menyalin token (izin clipboard?).";
      setError(message);
      alert(message);
    }
  };

  return (
    <div className="mx-auto mt-10 flex max-w-md flex-col gap-4 p-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>Internal test only</strong> — jangan dipakai di production.
      </div>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading && !user ? (
        <p className="text-sm text-neutral-500">Memuat session…</p>
      ) : null}

      {!user ? (
        <form
          onSubmit={handleSignIn}
          className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-neutral-900">
            Test login (Supabase)
          </h1>

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
              required
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Sign In
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Login berhasil — <strong>{user.email ?? user.id}</strong>
          </p>

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            Access token (JWT)
            <textarea
              readOnly
              value={sessionToken ?? ""}
              rows={8}
              className="font-mono text-xs break-all rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-800"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyToken}
              disabled={!sessionToken}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
            >
              Copy Token
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
