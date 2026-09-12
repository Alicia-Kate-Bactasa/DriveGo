"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Sparkles, Eye, ShieldCheck, PlusCircle, Compass } from "lucide-react";
import { PageShell } from "@/components/layout/header-wrapper";
import { Button } from "@/components/ui/button";
import { useSubmitModal } from "@/components/drive/submit-modal-context";
import { useUser } from "@/hooks/use-user";

export default function SubmitPage() {
  const { openSubmitModal } = useSubmitModal();
  const { user } = useUser();

  useEffect(() => {
    // Automatically open the Submit a Drive modal when visiting this page
    openSubmitModal();
  }, [openSubmitModal]);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-12 sm:pt-24 lg:px-8">
        {/* Call to action card */}
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles size={14} />
            <span>Drive Submission</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Submit a Donation Drive
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Share and manage community donation drives on DriveGo.
          </p>

          {/* Community Notice */}
          <div className="mt-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              How Publishing Works
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <Eye size={18} className="text-emerald-600" />
                  <span>Discover & Support</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-emerald-700">
                  Open to everyone
                </div>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  Anyone can freely explore, search, and view donation campaigns and updates across the community.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <ShieldCheck size={18} className="text-primary" />
                  <span>Organize & Publish</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-primary">
                  Free organizer account
                </div>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  Sign in to launch your campaign, share milestones, and coordinate needed items with supporters.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={openSubmitModal} size="md">
                <PlusCircle size={16} className="mr-2" />
                {user ? "Open Submit Drive Form" : "Sign In to Submit a Drive"}
              </Button>
              <Link
                href="/category/all"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <Compass size={16} className="mr-2 text-gray-500" />
                Explore Drives
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}