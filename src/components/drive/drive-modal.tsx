"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  MapPin,
  ExternalLink,
  Bookmark,
  BadgeCheck,
  Calendar,
  Share2,
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Category, Status } from "@prisma/client";
import { getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { CommunityVeracity } from "./community-veracity";
import { saveDrive, unsaveDrive, deleteDrive } from "./actions";
import { useUser } from "@/hooks/use-user";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { ExternalLinkModal } from "@/components/ui/external-link-modal";
import { getDomainTrust } from "@/lib/security";

export type DriveModalData = {
  id: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  mediaUrl?: string | null;
  category: Category;
  status: Status;
  location?: string | null;
  endsAt?: Date | string | null;
  trueVotesCount?: number;
  falseVotesCount?: number;
  adminReviewed?: boolean;
  userVote?: "TRUE_INFO" | "FALSE_INFO" | null;
  creatorId?: string | null;
  creator?: { displayName?: string | null } | null;
  organization?: { name?: string | null; verified?: boolean } | null;
  isSaved?: boolean;
};

interface DriveModalProps {
  drive: DriveModalData | null;
  open: boolean;
  onClose: () => void;
}

export function DriveModal({ drive, open, onClose }: DriveModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const { openAuthModal } = useAuthModal();
  const [isSaved, setIsSaved] = useState(drive?.isSaved ?? false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLinkWarning, setShowLinkWarning] = useState(false);

  // Always reset states when drive changes
  useEffect(() => {
    setImgError(false);
    setIsSaved(drive?.isSaved ?? false);
    setShowDeleteConfirm(false);
    setIsDeleting(false);
    setShowLinkWarning(false);
  }, [drive?.id, drive?.imageUrl, drive?.isSaved]);

  if (!open || !drive) return null;

  const endsAtDate = drive.endsAt ? new Date(drive.endsAt) : null;
  const isExpired = endsAtDate && endsAtDate < new Date();
  const isAutoRejected = (drive.falseVotesCount ?? 0) >= 8 || drive.status === Status.REJECTED;
  const isOwner = !!(user && drive.creatorId && drive.creatorId === user.id);

  const handleToggleSave = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setSaving(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      if (nextSaved) {
        await saveDrive(drive.id);
      } else {
        await unsaveDrive(drive.id);
      }
    } catch {
      setIsSaved(!nextSaved);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/?driveId=${drive.id}` : "";
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteDrive(drive.id);
      if (res.ok) {
        onClose();
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete drive:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-[36px] bg-white shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Actions & Close Button */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 sm:px-7 py-4 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Badge className="inline-flex items-center gap-1.5 shadow-2xs">
              <CategoryIcon category={drive.category} size={13} strokeWidth={2.2} />
              <span>{getCategoryLabel(drive.category)}</span>
            </Badge>

            {isAutoRejected ? (
              <Tag className="border-red-200 bg-red-50 text-red-700 font-bold text-[11px]">
                Under Review
              </Tag>
            ) : (
              <Tag className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                Active
              </Tag>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Owner Delete Button */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm((prev) => !prev)}
                disabled={isDeleting}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                title="Delete your drive"
                aria-label="Delete drive"
              >
                <Trash2 size={15} />
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition"
              title="Copy share link"
              aria-label="Share campaign"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>

            <button
              onClick={handleToggleSave}
              disabled={saving}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isSaved
                  ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                  : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 hover:text-gray-900"
              }`}
              title={isSaved ? "Saved" : "Save drive"}
              aria-label="Save drive"
            >
              <Bookmark size={16} className={isSaved ? "fill-purple-600" : ""} />
            </button>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition ml-1"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5 modal-scrollbar">
          {/* Owner Delete Confirmation Banner */}
          {showDeleteConfirm && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2 text-red-600 shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900">Delete this campaign?</h4>
                  <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                    Are you sure you want to permanently delete &quot;{drive.title}&quot;? This action cannot be undone.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      <span>{isDeleting ? "Deleting..." : "Yes, Delete Campaign"}</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drive Photo Banner - Always visible */}
          <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 shadow-2xs">
            {drive.imageUrl && !imgError ? (
              <img
                src={drive.imageUrl}
                alt={drive.title}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-primary/40">
                <span className="text-5xl mb-1.5">🎁</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {getCategoryLabel(drive.category)}
                </span>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {drive.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-primary" />
                <span>{drive.location || "Online / Community"}</span>
              </span>

              {drive.organization && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {drive.organization.verified && (
                      <BadgeCheck size={13} className="text-primary" />
                    )}
                    <span>{drive.organization.name}</span>
                  </span>
                </>
              )}

              {drive.creator && (
                <>
                  <span>•</span>
                  <span>Posted by {drive.creator.displayName || "Organizer"}</span>
                </>
              )}
            </div>
          </div>

          {/* Prominent Official Campaign Post Link */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 shadow-xs">
            <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">
              DriveGo serves as an informational directory. To participate, donate, or contact the organizers directly, visit the official drive post.
            </p>

            {drive.mediaUrl ? (
              <div className="space-y-2.5">
                {/* Domain Trust Badge */}
                {(() => {
                  const { isTrusted, domain } = getDomainTrust(drive.mediaUrl);
                  return isTrusted ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 rounded-full px-3 py-1 w-fit">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold">Trusted Platform</span>
                      <span className="text-emerald-700">({domain})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-full px-3 py-1 w-fit">
                      <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                      <span className="font-semibold">External Unverified Domain — Proceed with caution</span>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setShowLinkWarning(true)}
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-blue-600 transition active:scale-98 cursor-pointer"
                >
                  <span>Visit Official Campaign Post</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            ) : (
              <div className="rounded-full bg-gray-100 py-2.5 px-4 text-center text-xs font-medium text-gray-500">
                No external source post link provided
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              About This Drive
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {drive.description || drive.summary || "No description provided."}
            </p>
          </div>

          {/* Community Fact-Checking Section */}
          <div className="pt-2">
            <CommunityVeracity
              driveId={drive.id}
              initialTrueVotes={drive.trueVotesCount ?? 0}
              initialFalseVotes={drive.falseVotesCount ?? 0}
              initialUserVote={drive.userVote ?? null}
              adminReviewed={drive.adminReviewed ?? false}
              status={drive.status}
            />
          </div>
        </div>
      </div>

      {/* Safety Dialog Before Navigating to External Website */}
      <ExternalLinkModal
        url={drive.mediaUrl || null}
        open={showLinkWarning}
        onClose={() => setShowLinkWarning(false)}
      />
    </div>
  );
}
