"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { useUser } from "@/hooks/use-user";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Mail, Lock, User, AlertCircle, Globe } from "lucide-react";
import { CategorySelect } from "@/components/category/category-select";

type SubmitDriveModalProps = {
  open: boolean;
  onClose: () => void;
};

type UnauthView = "login" | "signup";

export function SubmitDriveModal({ open, onClose }: SubmitDriveModalProps) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  // Auth states for unauthenticated visitors
  const [unauthView, setUnauthView] = useState<UnauthView>("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Drive form states
  const [form, setForm] = useState({
    title: "",
    description: "",
    summary: "",
    imageUrl: "",
    mediaUrl: "",
    category: "MONETARY",
    location: "",
    endsAt: "",
  });
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);

  const resetAll = () => {
    setUnauthView("login");
    setAuthError(null);
    setDriveError(null);
    onClose();
  };

  const handleDriveChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDriveError(null);
    setDriveLoading(true);

    try {
      const res = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errMessage =
          typeof data.error === "object"
            ? Object.values(data.error?.fieldErrors || data.error || {})
                .flat()
                .join(", ")
            : data.error || "Failed to submit drive";
        setDriveError(errMessage || "An error occurred while submitting.");
        setDriveLoading(false);
        return;
      }

      const drive = await res.json();
      setDriveLoading(false);
      resetAll();
      router.push(`/drives/${drive.id}`);
      router.refresh();
    } catch (err: any) {
      setDriveError(err?.message || "Failed to submit drive");
      setDriveLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
      } else {
        setAuthLoading(false);
        setAuthError(null);
        router.refresh();
      }
    } catch (err: any) {
      setAuthError(err?.message || "Failed to sign in");
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { display_name: authDisplayName },
        },
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
      } else {
        setAuthLoading(false);
        setAuthError(null);
        router.refresh();
      }
    } catch (err: any) {
      setAuthError(err?.message || "Failed to create account");
      setAuthLoading(false);
    }
  };

  const handleBrowseDrives = () => {
    resetAll();
    router.push("/category/all");
  };

  // Determine modal title based on user state
  let modalTitle: ReactNode = "Submit a Drive";
  if (!user) {
    modalTitle =
      unauthView === "login" ? (
        <span className="text-primary">Sign In to Submit a Drive</span>
      ) : (
        <span className="text-primary">Create Account to Submit a Drive</span>
      );
  } else {
    modalTitle = <span className="text-primary">Create a Donation Drive</span>;
  }

  return (
    <Modal
      open={open}
      onClose={resetAll}
      title={modalTitle}
      maxWidth={!user ? "max-w-md" : "max-w-2xl"}
    >
      {userLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Checking authentication...</p>
        </div>
      ) : !user ? (
        /* ================= CLEAN, UNCLUTTERED AUTHENTICATION VIEW ================= */
        <div className="space-y-4">
          {/* Mode Switcher Pills */}
          <div className="flex rounded-[45px] bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setUnauthView("login");
                setAuthError(null);
              }}
              className={`flex-1 rounded-[45px] py-2 text-xs font-semibold sm:text-sm transition-all ${
                unauthView === "login"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setUnauthView("signup");
                setAuthError(null);
              }}
              className={`flex-1 rounded-[45px] py-2 text-xs font-semibold sm:text-sm transition-all ${
                unauthView === "signup"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Create Account
            </button>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Anyone can explore drives freely. To submit and organize your own campaign, please sign in or create an account.
          </p>

          {unauthView === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
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
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 rounded-[24px] bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 border border-red-100">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 text-sm sm:text-base font-semibold rounded-[45px] shadow-xs hover:shadow-md transition-all"
                >
                  {authLoading ? "Signing in..." : "Sign In & Continue"}
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-gray-500 space-y-2">
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setUnauthView("signup");
                      setAuthError(null);
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Create one for free
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={handleBrowseDrives}
                    className="text-gray-400 hover:text-gray-700 hover:underline"
                  >
                    Or browse drives without an account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
                  Organizer or Display Name
                </label>
                <div className="relative flex items-center">
                  <User size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
                  <Input
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                    placeholder="Your Name or Organization"
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
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
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
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-11"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 rounded-[24px] bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 border border-red-100">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 text-sm sm:text-base font-semibold rounded-[45px] shadow-xs hover:shadow-md transition-all"
                >
                  {authLoading ? "Creating account..." : "Create Account & Continue"}
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-gray-500 space-y-2">
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setUnauthView("login");
                      setAuthError(null);
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={handleBrowseDrives}
                    className="text-gray-400 hover:text-gray-700 hover:underline"
                  >
                    Or browse drives without an account
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ================= AUTHENTICATED DRIVE SUBMISSION FORM ================= */
        <div>
          <div className="mb-5 flex items-center justify-between rounded-[28px] bg-gray-50 border border-gray-100 px-4 py-2.5 text-xs text-gray-700">
            <span className="text-gray-600">
              Publishing as{" "}
              <strong className="text-gray-900 font-semibold">
                {user.user_metadata?.display_name || user.email?.split("@")[0]}
              </strong>
            </span>
            {user.email && (
              <span className="text-[11px] text-gray-400 font-normal">
                {user.email}
              </span>
            )}
          </div>

          <form onSubmit={handleDriveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                Campaign Title *
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleDriveChange}
                required
                minLength={3}
                maxLength={120}
                placeholder="e.g., Typhoon Relief Drive for Northern Samar"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                  Category *
                </label>
                <CategorySelect
                  value={form.category}
                  onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                  Location
                </label>
                <Input
                  name="location"
                  value={form.location}
                  onChange={handleDriveChange}
                  placeholder="e.g., Cebu City or Nationwide"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                Short Summary
              </label>
              <Input
                name="summary"
                value={form.summary}
                onChange={handleDriveChange}
                maxLength={300}
                placeholder="Brief one-line summary displayed on search cards"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleDriveChange}
                required
                minLength={20}
                maxLength={2000}
                rows={4}
                placeholder="Detailed information about the cause, beneficiaries, items needed, and instructions for donors..."
                className="w-full rounded-[28px] border border-gray-200 bg-white px-5 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                  Image Banner URL
                </label>
                <Input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleDriveChange}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                  Campaign Deadline
                </label>
                <Input
                  type="datetime-local"
                  name="endsAt"
                  value={form.endsAt}
                  onChange={handleDriveChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3 mb-1.5">
                Original Source / Verification URL
              </label>
              <Input
                type="url"
                name="mediaUrl"
                value={form.mediaUrl}
                onChange={handleDriveChange}
                placeholder="https://facebook.com/... or official link"
              />
            </div>

            {driveError && (
              <div className="flex items-center gap-2 rounded-[24px] bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 border border-red-100">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{driveError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/80 border border-blue-100/80 rounded-full px-3.5 py-1.5 w-fit">
                <Globe size={14} className="text-primary shrink-0" />
                <span className="font-medium">Open for anyone in the community to discover</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetAll} disabled={driveLoading} className="rounded-[45px] px-6 py-2.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={driveLoading} className="rounded-[45px] px-6 py-2.5">
                  {driveLoading ? "Publishing Drive..." : "Publish Drive"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
