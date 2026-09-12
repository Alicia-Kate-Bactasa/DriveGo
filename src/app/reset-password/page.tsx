"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/header-wrapper";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuthModal } from "@/components/auth/auth-modal-context";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();

  const urlError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(urlError ? decodeURIComponent(urlError) : null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Check if user is authenticated (via the exchange callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setSessionChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setHasSession(true);
      }
      setSessionChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
      setLoading(false);
    }
  };

  if (sessionChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Password Updated!
          </h1>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            Your password has been changed successfully. You can now use your new password to sign in to your DriveGo account.
          </p>

          <div className="mt-8">
            <LinkButton href="/" variant="primary" size="lg" className="w-full">
              Continue to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSession && !urlError) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Reset Link Expired or Invalid
          </h1>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            This password reset link is invalid or has expired. Please request a new link to reset your password.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => openAuthModal("forgot")}
            >
              Request New Reset Link
            </Button>
            <LinkButton href="/" variant="outline" size="lg" className="w-full">
              Back to Home
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-[24px] bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 border border-red-100">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm sm:text-base font-semibold rounded-[45px] shadow-xs hover:shadow-md transition-all"
              >
                {loading ? "Updating password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </PageShell>
  );
}
