"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Sparkles,
  Bookmark,
  HeartHandshake,
  Compass,
  Layers,
  ChevronDown,
  LogOut,
  ArrowRight,
  BookmarkX,
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
}: UserDashboardProps) {
  const router = useRouter();
  const { openSubmitModal } = useSubmitModal();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-24 text-gray-900">
      {/* ================= MINIMAL TOP NAVBAR ================= */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Section Navigation */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-primary transition hover:opacity-85"
            >
              DriveGo
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <a
                href="#categories"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-blue-50 hover:text-primary"
              >
                View Categories
              </a>
              <a
                href="#saved-drives"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-blue-50 hover:text-primary"
              >
                Saved Drives ({savedDrives.length})
              </a>
              <a
                href="#my-campaigns"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-blue-50 hover:text-primary"
              >
                My Campaigns ({userDrives.length})
              </a>
            </div>
          </div>

          {/* Right: Submit Button & User Name (Signout on click) */}
          <div className="flex items-center gap-3">
            <Button
              onClick={openSubmitModal}
              size="sm"
              className="rounded-[45px] px-4 font-semibold shadow-xs hidden sm:inline-flex"
            >
              <PlusCircle size={15} className="mr-1.5" />
              Submit a Drive
            </Button>

            {/* NAME button with Sign Out on click */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs sm:text-sm font-bold text-gray-800 shadow-2xs transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95"
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
                <div className="absolute right-0 top-full mt-2 w-52 rounded-[24px] border border-gray-100 bg-white p-2 shadow-xl shadow-black/10 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-[11px] font-medium text-gray-400">Signed in as</p>
                    <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
                    {user.email && (
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center gap-2 rounded-[18px] px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex items-center justify-around border-t border-gray-100 py-2 px-3 md:hidden text-xs">
          <a
            href="#categories"
            className="rounded-full px-2.5 py-1 font-semibold text-gray-600 hover:text-primary"
          >
            Categories
          </a>
          <a
            href="#saved-drives"
            className="rounded-full px-2.5 py-1 font-semibold text-gray-600 hover:text-primary"
          >
            Saved ({savedDrives.length})
          </a>
          <a
            href="#my-campaigns"
            className="rounded-full px-2.5 py-1 font-semibold text-gray-600 hover:text-primary"
          >
            My Drives ({userDrives.length})
          </a>
        </div>
      </nav>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-12">
        {/* Welcome Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles size={13} />
            <span>Community Organizer Hub</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Welcome back, {displayName}!
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
            Manage your community drives, rally supporters, and explore verified causes across the country.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={openSubmitModal}
              size="md"
              className="rounded-[45px] px-6 font-bold shadow-sm hover:scale-[1.02] active:scale-98 transition-all"
            >
              <PlusCircle size={16} className="mr-2" />
              Submit a Drive
            </Button>
            <a
              href="#categories"
              className="inline-flex items-center justify-center rounded-[45px] border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <Compass size={16} className="mr-2 text-primary" />
              Explore Causes
            </a>
          </div>
        </div>

        {/* ================= STATS AS LIST ================= */}
        <div className="rounded-[32px] border border-gray-200/80 bg-white p-6 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">
            Overview Summary
          </div>
          <ul className="divide-y divide-gray-100 sm:divide-y-0 sm:grid sm:grid-cols-4 sm:gap-6 text-sm">
            <li className="flex items-center justify-between py-3 sm:py-0 sm:flex-col sm:items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">My Drives</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">{userDrives.length}</span>
                <span className="text-xs text-gray-400">Campaigns created</span>
              </div>
            </li>

            <li className="flex items-center justify-between py-3 sm:py-0 sm:flex-col sm:items-start sm:border-l sm:border-gray-100 sm:pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">{activeDrivesCount}</span>
                <span className="text-xs text-gray-400">Currently live</span>
              </div>
            </li>

            <li className="flex items-center justify-between py-3 sm:py-0 sm:flex-col sm:items-start sm:border-l sm:border-gray-100 sm:pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Saved</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600">{savedDrives.length}</span>
                <span className="text-xs text-gray-400">Bookmarked drives</span>
              </div>
            </li>

            <li className="flex items-center justify-between py-3 sm:py-0 sm:flex-col sm:items-start sm:border-l sm:border-gray-100 sm:pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Donors Rallied</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">{totalDonorsRallied}</span>
                <span className="text-xs text-gray-400">Supporters reached</span>
              </div>
            </li>
          </ul>
        </div>

        {/* ================= MY CAMPAIGNS SECTION ================= */}
        <section id="my-campaigns" className="scroll-mt-24 pt-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
              <p className="mt-1 text-sm text-gray-500">
                Drives you have organized and published to the community.
              </p>
            </div>
            {userDrives.length > 0 && (
              <Button onClick={openSubmitModal} size="sm" className="rounded-[45px]">
                <PlusCircle size={14} className="mr-1.5" />
                New Drive
              </Button>
            )}
          </div>

          {userDrives.length === 0 ? (
            <div className="rounded-[36px] border border-dashed border-gray-200 bg-white p-10 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary">
                <HeartHandshake size={28} />
              </div>
              <h3 className="mt-3.5 text-lg font-bold text-gray-900">
                You haven&apos;t launched any donation drives yet
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                Rally support for your cause in minutes. Set up items needed, share milestones, and start connecting with donors.
              </p>
              <div className="mt-5">
                <Button
                  onClick={openSubmitModal}
                  size="sm"
                  className="rounded-[45px] px-5 font-semibold"
                >
                  <PlusCircle size={15} className="mr-1.5" />
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

        {/* ================= SAVED DRIVES SECTION ================= */}
        <section id="saved-drives" className="scroll-mt-24 pt-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Saved Drives</h2>
              <p className="mt-1 text-sm text-gray-500">
                Donation campaigns you are tracking and supporting.
              </p>
            </div>
            <Link
              href="/saved"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage all saved</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {savedDrives.length === 0 ? (
            <div className="rounded-[36px] border border-dashed border-gray-200 bg-white p-10 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <BookmarkX size={28} />
              </div>
              <h3 className="mt-3.5 text-lg font-bold text-gray-900">No saved drives yet</h3>
              <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                Click the bookmark button on any donation campaign to save it here for quick access.
              </p>
              <div className="mt-5">
                <a
                  href="#categories"
                  className="inline-flex items-center justify-center rounded-[45px] bg-primary px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-primary-dark"
                >
                  <Compass size={15} className="mr-1.5" />
                  Browse Categories
                </a>
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

        {/* ================= RE-USING CATEGORY COMPONENTS ================= */}
        <section id="categories" className="scroll-mt-24 pt-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>
              <p className="mt-1 text-sm text-gray-500">
                Browse different types of donation drives to find the causes you care about.
              </p>
            </div>
            <Link
              href="/category/all"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <CategoryCard isAllDrives />
            {sortedCategories.map((cat) => (
              <CategoryCard key={cat.name} category={cat.name} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
