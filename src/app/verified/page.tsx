"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Home, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/header-wrapper";
import { LinkButton } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function VerifiedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state change (e.g. if tokens were in URL hash)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <PageShell>
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Verification Complete
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Email Verified!
          </h1>

          <p className="mt-3 text-base text-gray-600 leading-relaxed max-w-md mx-auto">
            Your email address has been successfully verified. Your DriveGo account is active and ready to support or organize community donation drives.
          </p>

          {!loading && user?.email && (
            <div className="mt-4 inline-block rounded-xl bg-gray-50 border border-gray-200/80 px-4 py-2 text-sm text-gray-700">
              Verified as <span className="font-semibold text-gray-900">{user.email}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <LinkButton href="/" variant="primary" size="lg" className="w-full sm:w-auto">
              Continue to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </LinkButton>
            <LinkButton href="/category/all" variant="outline" size="lg" className="w-full sm:w-auto">
              Browse Drives
            </LinkButton>
          </div>

          <p className="mt-8 text-xs text-gray-400">
            Thank you for joining DriveGo in making a positive difference.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
