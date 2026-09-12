"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Bookmark,
  HeartHandshake,
  Compass,
  ChevronDown,
  LogOut,
  ArrowRight,
  BookmarkX,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriveCard } from "@/components/drive/drive-card";
import { CategoryCard } from "@/components/category/category-card";
import { useSubmitModal } from "@/components/drive/submit-modal-context";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Category, Status } from "@prisma/client";
import { CATEGORIES } from "@/lib/categories";

type SerializedDrive = {
  id: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  mediaUrl?: string | null;
  category: Category;
  status: Status;
  location?: string | null;
  endsAt?: string | null;
  progress?: number;
  donorsCount?: number;
  trueVotesCount?: number;
  falseVotesCount?: number;
  adminReviewed?: boolean;
  creatorId?: string;
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
}: UserDashboardProps) {
  const router = useRouter();
  const { openSubmitModal } = useSubmitModal();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"my-drives" | "categories" | "saved">("my-drives");

  const displayName =
    profile?.displayName ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "User";

  const activeDrivesCount = userDrives.filter((d) => d.status === "ACTIVE").length;
  const totalDonorsRallied = userDrives.reduce((acc, d) => acc + (d.donorsCount || 0), 0);
  const sortedCategories = [...CATEGORIES].sort((a, b) => a.order - b.order);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 pb-24">
      {/* ================= ADMIN NOTIFICATION BANNER ================= */}
      {profile?.role === "ADMIN" && (
        <div className="bg-blue-900 text-white px-4 py-2 text-xs sm:text-sm font-medium border-b border-blue-800">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-300 shrink-0" />
              <span>
                You are signed in as an <strong>Administrator</strong>. You can review flagged drives and moderate campaigns.
              </span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1 text-xs font-bold transition shadow-xs"
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* ================= TALLER, SPACIOUS TOP NAVBAR ================= */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 sm:h-22 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Brand Logo only (no out-of-place Go Back button) */}
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-primary transition hover:opacity-85"
          >
            DriveGo
          </Link>

          {/* Center Navigation Tabs */}
          <div className="hidden md:flex items-center rounded-full bg-gray-100/90 p-1.5 border border-gray-200/50">
            <button
              type="button"
              onClick={() => setActiveTab("my-drives")}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "my-drives"
                  ? "bg-white text-primary shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Campaigns ({userDrives.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "categories"
                  ? "bg-white text-primary shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Explore Categories
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "saved"
                  ? "bg-white text-primary shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Saved Drives ({savedDrives.length})
            </button>
          </div>

          {/* Right: Admin Link, Submit Button & User Name with Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-2xs"
                title="Open Admin Moderation Dashboard"
              >
                Admin
              </Link>
            )}

            <Button
              onClick={openSubmitModal}
              size="sm"
              className="rounded-[45px] px-5 py-2.5 font-bold shadow-xs hidden sm:inline-flex"
            >
              <PlusCircle size={16} className="mr-1.5" />
              Submit a Drive
            </Button>

            {/* NAME button with Sign Out on click */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-gray-800 shadow-2xs transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                title="Account menu"
              >
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{displayName}</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[24px] border border-gray-100 bg-white p-2 shadow-xl shadow-black/10 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <p className="text-[11px] font-medium text-gray-400">Signed in as</p>
                    <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
                    {user.email && (
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    )}
                  </div>

                  {profile?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="mt-1.5 flex w-full items-center gap-2 rounded-[18px] px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShieldCheck size={14} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-1.5 flex w-full items-center gap-2 rounded-[18px] px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnav Switcher */}
        <div className="flex items-center justify-around border-t border-gray-100 bg-gray-50/70 py-2.5 px-3 md:hidden text-xs">
          <button
            onClick={() => setActiveTab("my-drives")}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
              activeTab === "my-drives" ? "bg-white text-primary shadow-xs" : "text-gray-600"
            }`}
          >
            My Campaigns ({userDrives.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
              activeTab === "categories" ? "bg-white text-primary shadow-xs" : "text-gray-600"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
              activeTab === "saved" ? "bg-white text-primary shadow-xs" : "text-gray-600"
            }`}
          >
            Saved ({savedDrives.length})
          </button>
        </div>
      </nav>

      {/* ================= VIEW 1: MY CAMPAIGNS (DEDICATED HERO & PAGE) ================= */}
      {activeTab === "my-drives" && (
        <div>
          {/* Dedicated Hero Section */}
          <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    Welcome back, {displayName}!
                  </h1>
                  <p className="max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
                    Manage your community campaigns, track incoming support, and keep donors updated.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={openSubmitModal}
                    size="md"
                    className="rounded-[45px] px-6 font-bold shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-98 transition-all"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Submit a Drive
                  </Button>
                </div>
              </div>

              {/* Centered Overview List with Gray Divider Lines */}
              <div className="mt-8 rounded-[32px] border border-gray-200/80 bg-white px-4 py-5 shadow-xs max-w-3xl mx-auto">
                <ul className="grid grid-cols-3 divide-x divide-gray-200 text-center">
                  <li className="flex flex-col items-center justify-center p-3 sm:px-5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      My Drives:
                    </span>
                    <span className="mt-1 text-sm sm:text-base font-bold text-gray-900">
                      {userDrives.length} {userDrives.length === 1 ? "campaign" : "campaigns"}
                    </span>
                  </li>

                  <li className="flex flex-col items-center justify-center p-3 sm:px-5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Active:
                    </span>
                    <span className="mt-1 text-sm sm:text-base font-bold text-emerald-600">
                      {activeDrivesCount} live
                    </span>
                  </li>

                  <li className="flex flex-col items-center justify-center p-3 sm:px-5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Saved:
                    </span>
                    <span className="mt-1 text-sm sm:text-base font-bold text-purple-600">
                      {savedDrives.length} bookmarked
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Page Body Content */}
          <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-10">
            {userDrives.length === 0 ? (
              <div className="rounded-[40px] border border-dashed border-gray-200 bg-white p-14 text-center shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <HeartHandshake size={32} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  You haven&apos;t launched any donation drives yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
                  Rally support for your cause in minutes. Specify items needed, share milestones, and start connecting with donors.
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
          </section>
        </div>
      )}

      {/* ================= VIEW 2: EXPLORE CATEGORIES (DEDICATED HERO & PAGE) ================= */}
      {activeTab === "categories" && (
        <div>
          {/* Dedicated Hero Section */}
          <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    Explore Categories
                  </h1>
                  <p className="max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
                    Browse different types of donation drives to find and support causes across the community.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href="/category/all"
                    className="inline-flex items-center justify-center rounded-[45px] border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-300"
                  >
                    <span>View All Drives</span>
                    <ArrowRight size={14} className="ml-2 text-primary" />
                  </Link>
                  <Button
                    onClick={openSubmitModal}
                    size="md"
                    className="rounded-[45px] px-6 font-bold shadow-md shadow-primary/10"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Submit a Drive
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Page Body Content (Exact same CategoryCard components) */}
          <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <CategoryCard isAllDrives />
              {sortedCategories.map((cat) => (
                <CategoryCard key={cat.name} category={cat.name} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ================= VIEW 3: SAVED DRIVES (DEDICATED HERO & PAGE) ================= */}
      {activeTab === "saved" && (
        <div>
          {/* Dedicated Hero Section */}
          <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    Saved Drives
                  </h1>
                  <p className="max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
                    The donation campaigns you have bookmarked to follow progress and contribute to.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-full bg-purple-50 border border-purple-100 px-4 py-2 text-xs font-bold text-purple-700">
                    {savedDrives.length} {savedDrives.length === 1 ? "Drive" : "Drives"} Bookmarked
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Page Body Content */}
          <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-10">
            {savedDrives.length === 0 ? (
              <div className="rounded-[40px] border border-dashed border-gray-200 bg-white p-14 text-center shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <BookmarkX size={32} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">No saved drives yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
                  Click the bookmark button on any donation campaign to save it here for quick access.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("categories")}
                    className="inline-flex items-center justify-center rounded-[45px] bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-dark"
                  >
                    <Compass size={16} className="mr-2" />
                    Browse Categories to Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedDrives.map((drive) => (
                  <DriveCard key={drive.id} {...drive} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
