"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Mail, Lock, User, AlertCircle } from "lucide-react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup" | "forgot";
};

export function AuthModal({
  open,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setIsRedirecting(false);
    setEmailSent(false);
    setResetEmailSent(false);
  }, [initialMode, open]);

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode);
    setError(null);
    setEmailSent(false);
    setResetEmailSent(false);
  };

  const handleClose = () => {
    if (isRedirecting) return;
    setError(null);
    setEmailSent(false);
    setResetEmailSent(false);
    onClose();
    if (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") {
      router.push("/");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setIsRedirecting(true);
        window.location.replace("/");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/verified`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data.session) {
        setIsRedirecting(true);
        window.location.replace("/");
      } else {
        // Confirmation email sent
        setEmailSent(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/reset-password`
        : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setResetEmailSent(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link");
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isRedirecting ? (
          <span className="text-primary">DriveGo</span>
        ) : emailSent ? (
          <span className="text-primary">Verify Your Email</span>
        ) : resetEmailSent ? (
          <span className="text-primary">Check Your Inbox</span>
        ) : mode === "forgot" ? (
          <span className="text-primary">Reset Password</span>
        ) : mode === "login" ? (
          <span className="text-primary">Welcome to DriveGo</span>
        ) : (
          <span className="text-primary">Create Account</span>
        )
      }
      maxWidth="max-w-md"
    >
      {resetEmailSent ? (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Reset link sent</h3>
            <p className="text-sm text-gray-600 mt-2 max-w-sm leading-relaxed">
              We sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>. Click the link to create a new password.
            </p>
          </div>
          <div className="pt-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => {
                setResetEmailSent(false);
                setMode("login");
              }}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      ) : emailSent ? (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Check your inbox</h3>
            <p className="text-sm text-gray-600 mt-2 max-w-sm leading-relaxed">
              We sent a verification link to <span className="font-semibold text-gray-900">{email}</span>. Click the link to verify your account and get started.
            </p>
          </div>
          <div className="pt-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setMode("login");
              }}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      ) : isRedirecting ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-100 border-t-primary" />
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {mode === "login" ? "Welcome back!" : "Account created!"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Taking you to your dashboard...</p>
          </div>
        </div>
      ) : mode === "forgot" ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Enter your email address and we&apos;ll send you a secure link to reset your password.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-11"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[24px] bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 border border-red-100">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm sm:text-base font-semibold rounded-[45px] shadow-xs hover:shadow-md transition-all"
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-900"
              onClick={() => switchMode("login")}
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      ) : (
        <>
          {/* Mode Switcher Pills */}
          <div className="mb-6 flex rounded-[45px] bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-[45px] py-2 text-xs font-semibold sm:text-sm transition-all ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-[45px] py-2 text-xs font-semibold sm:text-sm transition-all ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Create Account
            </button>
          </div>

          <p className="mb-6 text-sm text-gray-600 leading-relaxed">
            {mode === "login"
              ? "Sign in to your account to organize donation campaigns and save drives."
              : "Create a free account to launch donation drives and connect with your community."}
          </p>

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-11"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-3 pr-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Password
              </label>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11"
                required
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>

          <p className="pt-2 text-center text-xs sm:text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="font-semibold text-primary hover:underline"
            >
              Create one for free
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
              Full Name or Organization
            </label>
            <div className="relative flex items-center">
              <User size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Maria Santos"
                className="pl-11"
                required
                minLength={2}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-11"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pl-11"
                required
                minLength={8}
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>

          <p className="pt-2 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      )}
        </>
      )}
    </Modal>
  );
}
