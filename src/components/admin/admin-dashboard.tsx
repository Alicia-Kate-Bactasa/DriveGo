"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Eye,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2,
  Filter,
  LogOut,
  X,
} from "lucide-react";
import { Category, Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  putBackUpDriveAdmin,
  deleteDrive,
  updateDriveStatus,
} from "@/app/admin/actions";
import { getDomainTrust } from "@/lib/security";
import { ExternalLinkModal } from "@/components/ui/external-link-modal";

export type DriveItem = {
  id: string;
  title: string;
  summary: string | null;
  description: string;
  category: Category;
  status: Status;
  location: string | null;
  imageUrl: string | null;
  mediaUrl: string | null;
  endsAt: Date | string | null;
  createdAt: Date | string;
  progress: number;
  donorsCount: number;
  trueVotesCount?: number;
  falseVotesCount?: number;
  adminReviewed?: boolean;
  creator: { id: string; displayName: string | null; email: string };
  organization: { id: string; name: string; slug: string; verified: boolean } | null;
};

type AdminDashboardProps = {
  initialDrives: DriveItem[];
  currentUser: { email?: string; role?: string };
};

type FilterTab = "all" | "flagged" | "active" | "reviewed" | "rejected";

export function AdminDashboard({
  initialDrives,
  currentUser,
}: AdminDashboardProps) {
  const router = useRouter();
  const [drives, setDrives] = useState<DriveItem[]>(initialDrives);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Filters
  const [currentTab, setCurrentTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("flagged_desc");

  // Moderation modals
  const [reviewingDrive, setReviewingDrive] = useState<DriveItem | null>(null);
  const [deletingDrive, setDeletingDrive] = useState<DriveItem | null>(null);
  const [externalWarningUrl, setExternalWarningUrl] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = drives.length;
    const flagged = drives.filter(
      (d) => (d.falseVotesCount ?? 0) >= 8 || d.status === Status.REJECTED
    ).length;
    const active = drives.filter((d) => d.status === Status.ACTIVE).length;
    const reviewed = drives.filter((d) => d.adminReviewed).length;

    return { total, flagged, active, reviewed };
  }, [drives]);

  // Filtered and sorted drives
  const filteredDrives = useMemo(() => {
    return drives
      .filter((drive) => {
        // Tab filtering
        const isFlagged =
          (drive.falseVotesCount ?? 0) >= 8 || drive.status === Status.REJECTED;

        if (currentTab === "flagged" && !isFlagged) return false;
        if (currentTab === "active" && drive.status !== Status.ACTIVE) return false;
        if (currentTab === "reviewed" && !drive.adminReviewed) return false;
        if (currentTab === "rejected" && drive.status !== Status.REJECTED) return false;

        // Category filtering
        if (categoryFilter !== "ALL" && drive.category !== categoryFilter) {
          return false;
        }

        // Search filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = drive.title.toLowerCase().includes(q);
          const matchDesc = drive.description.toLowerCase().includes(q);
          const matchLoc = drive.location?.toLowerCase().includes(q) || false;
          const matchCreator =
            drive.creator.displayName?.toLowerCase().includes(q) ||
            drive.creator.email.toLowerCase().includes(q);
          const matchOrg = drive.organization?.name.toLowerCase().includes(q) || false;

          if (!matchTitle && !matchDesc && !matchLoc && !matchCreator && !matchOrg) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "flagged_desc") {
          return (b.falseVotesCount ?? 0) - (a.falseVotesCount ?? 0);
        }
        if (sortBy === "true_desc") {
          return (b.trueVotesCount ?? 0) - (a.trueVotesCount ?? 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [drives, currentTab, categoryFilter, searchQuery, sortBy]);

  // Action: Keep Drive (Dismiss False Reports & Restore Status)
  const handleKeepDrive = async (drive: DriveItem) => {
    setBusyId(drive.id);
    try {
      const res = await putBackUpDriveAdmin(drive.id);
      if (res.success) {
        setDrives((prev) =>
          prev.map((d) =>
            d.id === drive.id
              ? {
                  ...d,
                  status: Status.ACTIVE,
                  falseVotesCount: 0,
                  adminReviewed: true,
                }
              : d
          )
        );
        if (reviewingDrive?.id === drive.id) {
          setReviewingDrive(null);
        }
        showNotification(
          `✓ "${drive.title}" verified and kept active. False reports cleared.`
        );
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to keep drive:", err);
      alert("Failed to keep drive. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  // Action: Delete Drive (When reports are true / fraudulent)
  const handleConfirmDelete = async () => {
    if (!deletingDrive) return;
    const targetId = deletingDrive.id;
    const targetTitle = deletingDrive.title;

    setBusyId(targetId);
    try {
      const res = await deleteDrive(targetId);
      if (res.success) {
        setDrives((prev) => prev.filter((d) => d.id !== targetId));
        setDeletingDrive(null);
        if (reviewingDrive?.id === targetId) {
          setReviewingDrive(null);
        }
        showNotification(`✓ Campaign "${targetTitle}" has been permanently deleted.`);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete drive:", err);
      alert("Failed to delete drive. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* ================= DEDICATED ADMIN TOP NAVBAR ================= */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 sm:h-22 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-primary transition hover:opacity-85"
            >
              DriveGo
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
              className="rounded-full gap-1.5 text-xs font-semibold"
            >
              <RefreshCw size={13} /> Refresh
            </Button>

            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-2xs">
              Admin
            </span>

            <Button
              onClick={handleSignOut}
              size="sm"
              variant="ghost"
              className="rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 px-3.5 py-1.5 text-xs font-semibold transition-all gap-1.5"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Top Notification Toast */}
      {actionSuccessMessage && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} />
          <span>{actionSuccessMessage}</span>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="ml-2 rounded-full p-1 hover:bg-emerald-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero / Header Section */}
      <div className="border-b border-gray-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Drive Moderation & Tracking
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track community veracity reports, review flagged donation drives, and clear or delete campaigns.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.refresh()}
                className="rounded-full gap-1.5 text-xs font-semibold"
              >
                <RefreshCw size={13} /> Refresh Data
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Drives
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{metrics.total}</p>
            </div>

            <div
              className={`rounded-2xl border p-3.5 transition ${
                metrics.flagged > 0
                  ? "border-red-200 bg-red-50/80 text-red-900"
                  : "border-gray-100 bg-gray-50/70 text-gray-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
                  Flagged (8+ Reports)
                </span>
                {metrics.flagged > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <p className="text-2xl font-bold mt-0.5">{metrics.flagged}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Active Drives
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{metrics.active}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Admin Reviewed
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{metrics.reviewed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setCurrentTab("all")}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              currentTab === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Drives ({metrics.total})
          </button>

          <button
            onClick={() => setCurrentTab("flagged")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              currentTab === "flagged"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            }`}
          >
            <ShieldAlert size={15} />
            <span>Flagged (8+ False Reports)</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.2 text-[11px] font-bold ${
                currentTab === "flagged" ? "bg-white/20 text-white" : "bg-red-200 text-red-800"
              }`}
            >
              {metrics.flagged}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("active")}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              currentTab === "active"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Active ({metrics.active})
          </button>

          <button
            onClick={() => setCurrentTab("reviewed")}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              currentTab === "reviewed"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Admin Cleared ({metrics.reviewed})
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-200/80 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by drive title, organizer, location, or cause..."
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 pl-10 pr-9 py-2 text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-full border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-semibold text-gray-700 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-semibold text-gray-700 focus:border-primary focus:outline-none"
            >
              <option value="flagged_desc">Highest False Reports First</option>
              <option value="true_desc">Most True Info Votes First</option>
              <option value="newest">Newest Submitted</option>
              <option value="oldest">Oldest Submitted</option>
            </select>
          </div>
        </div>

        {/* Drives List / Table */}
        <div className="mt-5 space-y-3">
          {filteredDrives.length === 0 ? (
            <div className="rounded-[36px] border border-gray-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Filter size={20} />
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-900">No drives match your filters</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {currentTab === "flagged"
                  ? "Great news! There are currently no drives with 8+ false info reports requiring review."
                  : "Try clearing your search query or selecting another category filter."}
              </p>
              {(searchQuery || categoryFilter !== "ALL" || currentTab !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("ALL");
                    setCurrentTab("all");
                  }}
                  className="mt-4 rounded-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            filteredDrives.map((drive) => {
              const falseCount = drive.falseVotesCount ?? 0;
              const trueCount = drive.trueVotesCount ?? 0;
              const isOverThreshold = falseCount >= 8;
              const isRejected = drive.status === Status.REJECTED;
              const isBusy = busyId === drive.id;

              return (
                <div
                  key={drive.id}
                  className={`group relative overflow-hidden rounded-[32px] border bg-white p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                    isOverThreshold || isRejected
                      ? "border-red-200 bg-red-50/20 hover:border-red-300"
                      : drive.adminReviewed
                      ? "border-blue-100 hover:border-blue-200"
                      : "border-gray-200/90 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Drive Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Image Thumbnail or Category Icon */}
                      <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
                        {drive.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={drive.imageUrl}
                            alt={drive.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400 bg-blue-50/50">
                            <CategoryIcon category={drive.category} size={28} />
                          </div>
                        )}
                      </div>

                      {/* Main info text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="text-[11px] font-semibold">
                            <CategoryIcon category={drive.category} size={11} className="mr-1 inline" />
                            {getCategoryLabel(drive.category)}
                          </Badge>

                          {/* Status Pill */}
                          {isRejected ? (
                            <Tag className="bg-red-100 text-red-800 border-red-200 font-bold text-[11px]">
                              Suspended / Rejected
                            </Tag>
                          ) : isOverThreshold ? (
                            <Tag className="bg-red-100 text-red-800 border-red-200 font-bold text-[11px] flex items-center gap-1">
                              <ShieldAlert size={12} /> 8+ False Reports
                            </Tag>
                          ) : drive.status === Status.ACTIVE ? (
                            <Tag className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[11px]">
                              Active
                            </Tag>
                          ) : (
                            <Tag className="bg-gray-100 text-gray-700 text-[11px]">
                              {drive.status}
                            </Tag>
                          )}

                          {drive.adminReviewed && (
                            <Tag className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle2 size={11} /> Admin Cleared
                            </Tag>
                          )}
                        </div>

                        <h3 className="mt-1.5 text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                          {drive.title}
                        </h3>

                        {drive.summary && (
                          <p className="mt-0.5 text-xs sm:text-sm text-gray-500 line-clamp-1">
                            {drive.summary}
                          </p>
                        )}

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-gray-700">
                            <User size={13} className="text-gray-400" />
                            <span>
                              {drive.creator.displayName || "Unknown"} (
                              <span className="text-gray-500">{drive.creator.email}</span>)
                            </span>
                          </span>

                          {drive.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-gray-400" />
                              <span>{drive.location}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{new Date(drive.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Community Veracity Vote Counters */}
                    <div className="flex items-center gap-3 shrink-0 rounded-2xl bg-gray-50 p-3 border border-gray-100/80">
                      {/* True Votes */}
                      <div className="flex items-center gap-2 px-2.5 py-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <ThumbsUp size={13} />
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            True Info
                          </span>
                          <span className="text-sm font-bold text-emerald-900">
                            {trueCount} votes
                          </span>
                        </div>
                      </div>

                      <div className="h-7 w-px bg-gray-200" />

                      {/* False Reports */}
                      <div className="flex items-center gap-2 px-2.5 py-1">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            isOverThreshold
                              ? "bg-red-500 text-white animate-bounce"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <ThumbsDown size={13} />
                        </div>
                        <div>
                          <span
                            className={`block text-[10px] font-bold uppercase tracking-wider ${
                              isOverThreshold ? "text-red-700 font-extrabold" : "text-red-600"
                            }`}
                          >
                            False Reports
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isOverThreshold ? "text-red-700" : "text-gray-900"
                            }`}
                          >
                            {falseCount} reports
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Moderation Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Review Details Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewingDrive(drive)}
                        className="rounded-full gap-1 text-xs font-semibold"
                        title="Review campaign details and evidence"
                      >
                        <Eye size={14} />
                        <span>Review</span>
                      </Button>

                      {/* Make It Stay / Keep Drive (Dismiss Reports) */}
                      {(isOverThreshold || isRejected || falseCount > 0) && (
                        <Button
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleKeepDrive(drive)}
                          className="rounded-full gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                          title="Verify as authentic and clear false reports"
                        >
                          {isBusy ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          <span>Keep Drive</span>
                        </Button>
                      )}

                      {/* Delete Drive (If reports are true / fraudulent) */}
                      <button
                        disabled={isBusy}
                        onClick={() => setDeletingDrive(drive)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                        title="Delete fraudulent campaign"
                        aria-label="Delete campaign"
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* Link to Official Media / Source if present */}
                      {drive.mediaUrl && (
                        <button
                          type="button"
                          onClick={() => setExternalWarningUrl(drive.mediaUrl)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                          title="Inspect official verification source link"
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REVIEW DRIVE DETAILS */}
      {/* ========================================================================= */}
      {reviewingDrive && (
        <Modal
          open={!!reviewingDrive}
          onClose={() => setReviewingDrive(null)}
          title="Review Campaign"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            {/* Banner Photo if present */}
            {reviewingDrive.imageUrl && (
              <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={reviewingDrive.imageUrl}
                  alt={reviewingDrive.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Title & Metadata */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="text-xs">
                  <CategoryIcon category={reviewingDrive.category} size={12} className="mr-1 inline" />
                  {getCategoryLabel(reviewingDrive.category)}
                </Badge>

                {(reviewingDrive.falseVotesCount ?? 0) >= 8 && (
                  <Tag className="bg-red-100 text-red-800 font-bold text-xs border-red-200">
                    Flagged (8+ False Reports)
                  </Tag>
                )}

                {reviewingDrive.adminReviewed && (
                  <Tag className="bg-blue-50 text-blue-700 font-semibold text-xs border-blue-200">
                    Admin Cleared
                  </Tag>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {reviewingDrive.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={13} className="text-gray-400" />
                  <span>
                    Posted by: <strong>{reviewingDrive.creator.displayName || "Unknown"}</strong> (
                    {reviewingDrive.creator.email})
                  </span>
                </span>

                {reviewingDrive.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-gray-400" />
                    <span>{reviewingDrive.location}</span>
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{new Date(reviewingDrive.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {/* Official Source Link */}
            {reviewingDrive.mediaUrl ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Official Verification Post / Source
                    </span>
                    <p className="text-xs text-blue-900 truncate mt-0.5 font-medium">
                      {reviewingDrive.mediaUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExternalWarningUrl(reviewingDrive.mediaUrl)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shrink-0 shadow-2xs cursor-pointer"
                  >
                    <span>Inspect Link</span>
                    <ExternalLink size={13} />
                  </button>
                </div>

                {/* Domain Trust Indicator */}
                {(() => {
                  const trust = getDomainTrust(reviewingDrive.mediaUrl);
                  return trust.isTrusted ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/70 border border-emerald-200 rounded-full px-3 py-0.5 w-fit">
                      <ShieldCheck size={13} className="text-emerald-700" />
                      <span className="font-semibold">Trusted Platform</span>
                      <span className="text-emerald-700 font-medium">({trust.domain})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-100/70 border border-amber-200 rounded-full px-3 py-0.5 w-fit">
                      <AlertTriangle size={13} className="text-amber-700" />
                      <span className="font-semibold">External Unverified Domain — Proceed with caution ({trust.domain})</span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                ⚠️ Organizer did not provide an official external verification post.
              </div>
            )}

            {/* Votes Breakdown Box */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Community Veracity Status
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 border border-gray-100 text-center">
                  <span className="text-xs font-semibold text-emerald-700">Valid / True Info</span>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {reviewingDrive.trueVotesCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-gray-100 text-center">
                  <span className="text-xs font-semibold text-red-600">Reported False Info</span>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {reviewingDrive.falseVotesCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Campaign Description
              </h4>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                {reviewingDrive.description}
              </div>
            </div>

            {/* Moderation Decision Actions */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                Decide whether to verify this drive or delete it if reports are confirmed.
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* Delete Campaign */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingDrive(reviewingDrive)}
                  className="rounded-full text-xs font-semibold gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete Campaign</span>
                </Button>

                {/* Make It Stay / Keep Drive */}
                <Button
                  size="sm"
                  onClick={() => handleKeepDrive(reviewingDrive)}
                  className="rounded-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 size={14} />
                  <span>Keep Drive (Clear Reports)</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETION */}
      {/* ========================================================================= */}
      {deletingDrive && (
        <Modal
          open={!!deletingDrive}
          onClose={() => setDeletingDrive(null)}
          title="Confirm Campaign Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="rounded-full bg-red-100 p-2 text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">
                  Delete &quot;{deletingDrive.title}&quot;?
                </h4>
                <p className="mt-1 text-xs text-red-700 leading-relaxed">
                  If the community reports of false information or fraud are accurate, you can permanently delete this donation drive from the platform. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
              <div>
                <strong>Organizer:</strong> {deletingDrive.creator.displayName || deletingDrive.creator.email}
              </div>
              <div>
                <strong>Current False Reports:</strong> {deletingDrive.falseVotesCount ?? 0}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingDrive(null)}
                disabled={busyId === deletingDrive.id}
                className="rounded-full px-4"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={busyId === deletingDrive.id}
                className="rounded-full px-4 gap-1.5"
              >
                {busyId === deletingDrive.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                <span>Yes, Delete Campaign</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* External Link Safety Exit Dialog */}
      <ExternalLinkModal
        url={externalWarningUrl}
        open={!!externalWarningUrl}
        onClose={() => setExternalWarningUrl(null)}
      />
    </div>
  );
}
