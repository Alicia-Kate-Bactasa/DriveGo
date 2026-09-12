"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Mail, Lock, User, AlertCircle } from "lucide-react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
};

export function AuthModal({
  open,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError(null);
  };

  const handleClose = () => {
    setError(null);
    onClose();
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
        setLoading(false);
        handleClose();
        router.refresh();
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setLoading(false);
        handleClose();
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        mode === "login" ? (
          <span className="text-primary">Welcome to DriveGo</span>
        ) : (
          <span className="text-primary">Create an Account</span>
        )
      }
      maxWidth="max-w-md"
    >
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
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
              Password
            </label>
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
    </Modal>
  );
}
