"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Sparkles,
  Bookmark,
  HeartHandshake,
  Compass,
  Layers,
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriveCard } from "@/components/drive/drive-card";
import { useSubmitModal } from "@/components/drive/submit-modal-context";
import { Category, Status } from "@prisma/client";
import { CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";

type SerializedDrive = {
  id: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  category: Category;
  status: Status;
  location?: string | null;
  endsAt?: string | null;
  progress?: number;
  donorsCount?: number;
  creator?: { displayName?: string | null };
  organization?: { name?: string | null; verified?: boolean } | null;
};

type UserDashboardProps = {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: {
      display_name?: string;
    };
  };
  profile?: {
    id: string;
    displayName?: string | null;
    email: string;
    role: string;
  } | null;
  userDrives: SerializedDrive[];
  savedDrives: SerializedDrive[];
  recentDrives: SerializedDrive[];
};

export function UserDashboard({
  user,
  profile,
  userDrives = [],
  savedDrives = [],
  recentDrives = [],
}: UserDashboardProps) {
  const { openSubmitModal } = useSubmitModal();
  const [activeTab, setActiveTab] = useState<"my-drives" | "saved" | "explore">("my-drives");

  const displayName =
    profile?.displayName ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Organizer";

  const activeDrivesCount = userDrives.filter((d) => d.status === "ACTIVE").length;
  const totalDonorsRallied = userDrives.reduce((acc, d) => acc + (d.donorsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-[40px] border border-blue-100/80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white shadow-xl shadow-blue-900/10">
          {/* Subtle decorative backdrop circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-400/20 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={14} className="text-yellow-300" />
                <span>Community Organizer Hub</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Welcome back, {displayName}!
              </h1>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                Manage your community drives, rally supporters, and explore verified causes across the country.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={openSubmitModal}
                size="lg"
                className="rounded-[45px] bg-white text-primary hover:bg-blue-50 font-bold shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-98 transition-all px-6"
              >
                <PlusCircle size={18} className="mr-2 text-primary" />
                Submit a Drive
              </Button>
              <Link
                href="/category/all"
                className="inline-flex items-center justify-center rounded-[45px] border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02]"
              >
                <Compass size={18} className="mr-2" />
                Explore Causes
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">My Drives</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                <Layers size={16} />
              </span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-gray-900">{userDrives.length}</div>
            <p className="mt-1 text-xs text-gray-500">Campaigns created</p>
          </div>

          <div className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={16} />
              </span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-emerald-600">{activeDrivesCount}</div>
            <p className="mt-1 text-xs text-gray-500">Currently live</p>
          </div>

          <div className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Saved</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Bookmark size={16} />
              </span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-purple-600">{savedDrives.length}</div>
            <p className="mt-1 text-xs text-gray-500">Bookmarked drives</p>
          </div>

          <div className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Donors Rallied</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Users size={16} />
              </span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-amber-600">{totalDonorsRallied}</div>
            <p className="mt-1 text-xs text-gray-500">Community support</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-10 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("my-drives")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeTab === "my-drives"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Layers size={16} />
              <span>My Campaigns</span>
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === "my-drives" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {userDrives.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeTab === "saved"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Bookmark size={16} />
              <span>Saved</span>
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === "saved" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {savedDrives.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("explore")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeTab === "explore"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Compass size={16} />
              <span>Explore Causes</span>
            </button>
          </div>

          <Link
            href="/category/all"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>Browse all categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {/* TAB 1: My Drives */}
          {activeTab === "my-drives" && (
            <div>
              {userDrives.length === 0 ? (
                <div className="rounded-[40px] border border-dashed border-gray-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <HeartHandshake size={32} />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    You haven&apos;t launched any donation drives yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
                    Ready to rally support for a community cause? Submit your campaign in minutes, share updates, and accept donations.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={openSubmitModal}
                      size="md"
                      className="rounded-[45px] px-6 font-semibold"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Launch Your First Drive
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userDrives.map((drive) => (
                    <DriveCard key={drive.id} {...drive} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Saved Drives */}
          {activeTab === "saved" && (
            <div>
              {savedDrives.length === 0 ? (
                <div className="rounded-[40px] border border-dashed border-gray-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Bookmark size={32} />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    No saved drives yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
                    Bookmark campaigns you want to track, support later, or share with friends.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/category/all"
                      className="inline-flex items-center justify-center rounded-[45px] bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                    >
                      <Compass size={16} className="mr-2" />
                      Browse Drives to Save
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedDrives.map((drive) => (
                    <DriveCard key={drive.id} {...drive} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Explore Community Causes */}
          {activeTab === "explore" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentDrives.map((drive) => (
                  <DriveCard key={drive.id} {...drive} />
                ))}
              </div>

              <div className="rounded-[32px] border border-blue-100 bg-blue-50/50 p-6 text-center">
                <h4 className="text-base font-bold text-gray-900">Looking for more specific causes?</h4>
                <p className="mt-1 text-xs text-gray-600">Filter drives by disaster relief, healthcare, education, and more.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {CATEGORIES.slice(0, 5).map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/category/${cat.name.toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-blue-50 hover:text-primary transition-all"
                    >
                      <CategoryIcon category={cat.name} size={13} />
                      <span>{cat.label}</span>
                    </Link>
                  ))}
                  <Link
                    href="/category/all"
                    className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-dark"
                  >
                    All Categories &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
