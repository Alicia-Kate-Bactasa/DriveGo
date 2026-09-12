"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, Flag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { voteDrive } from "./actions";

type CommunityVeracityProps = {
  driveId: string;
  initialTrueVotes?: number;
  initialFalseVotes?: number;
  initialUserVote?: "TRUE_INFO" | "FALSE_INFO" | null;
  adminReviewed?: boolean;
  status?: string;
};

export function CommunityVeracity({
  driveId,
  initialTrueVotes = 0,
  initialFalseVotes = 0,
  initialUserVote = null,
  adminReviewed = false,
  status = "ACTIVE",
}: CommunityVeracityProps) {
  const { user } = useUser();
  const { openAuthModal } = useAuthModal();

  const [trueVotes, setTrueVotes] = useState(initialTrueVotes);
  const [falseVotes, setFalseVotes] = useState(initialFalseVotes);
  const [userVote, setUserVote] = useState<"TRUE_INFO" | "FALSE_INFO" | null>(
    initialUserVote
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoRejected, setIsAutoRejected] = useState(
    falseVotes >= 8 || status === "REJECTED"
  );

  const handleVote = async (type: "TRUE_INFO" | "FALSE_INFO") => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (isSubmitting) return;

    // Optimistic calculation
    const prevVote = userVote;
    const prevTrue = trueVotes;
    const prevFalse = falseVotes;

    if (prevVote === type) {
      // Toggle off
      setUserVote(null);
      if (type === "TRUE_INFO") setTrueVotes((p) => Math.max(0, p - 1));
      if (type === "FALSE_INFO") setFalseVotes((p) => Math.max(0, p - 1));
    } else {
      // Switch or new vote
      setUserVote(type);
      if (type === "TRUE_INFO") {
        setTrueVotes((p) => p + 1);
        if (prevVote === "FALSE_INFO") setFalseVotes((p) => Math.max(0, p - 1));
      } else {
        setFalseVotes((p) => p + 1);
        if (prevVote === "TRUE_INFO") setTrueVotes((p) => Math.max(0, p - 1));
      }
    }

    setIsSubmitting(true);
    try {
      const res = await voteDrive(driveId, type);
      if (res.ok) {
        setUserVote(res.userVote);
        setTrueVotes(res.trueVotesCount);
        setFalseVotes(res.falseVotesCount);
        if (res.isAutoRejected) {
          setIsAutoRejected(true);
        }
      }
    } catch (err) {
      // Revert optimistic on error
      setUserVote(prevVote);
      setTrueVotes(prevTrue);
      setFalseVotes(prevFalse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportsRemaining = Math.max(0, 8 - falseVotes);

  return (
    <div className="rounded-[36px] border border-gray-100 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="font-bold text-gray-900 text-base">
              Community Fact-Checking
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Public veracity review. Visible to everyone; signed-in members can vote.
          </p>
        </div>

        {/* Veracity Status Badge */}
        <div className="flex items-center gap-2">
          {adminReviewed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} />
              Admin Verified
            </span>
          ) : isAutoRejected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
              <AlertTriangle size={13} />
              Under Admin Review (8 Reports)
            </span>
          ) : falseVotes > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              <Flag size={12} />
              {falseVotes} {falseVotes === 1 ? "report" : "reports"}
            </span>
          ) : trueVotes > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
              <CheckCircle2 size={12} />
              {trueVotes} verified
            </span>
          ) : null}
        </div>
      </div>

      {/* Warning banner if auto-rejected due to 8 reports */}
      {isAutoRejected && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-red-900">
            <ShieldAlert size={16} className="shrink-0 text-red-600" />
            <span>Campaign Removed for Admin Review</span>
          </div>
          <p className="leading-relaxed">
            This drive has accumulated {falseVotes} reports of false information (threshold: 8) and has been removed from public directory listings. It is currently being reviewed for validity by administrators.
          </p>
        </div>
      )}

      {/* Voting Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* True Info Button */}
          <Button
            type="button"
            size="sm"
            variant={userVote === "TRUE_INFO" ? "primary" : "outline"}
            onClick={() => handleVote("TRUE_INFO")}
            disabled={isSubmitting}
            className={`rounded-full px-4 text-xs gap-1.5 font-medium transition-all ${
              userVote === "TRUE_INFO"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            }`}
          >
            <CheckCircle2 size={14} className={userVote === "TRUE_INFO" ? "text-white" : "text-emerald-600"} />
            <span>True Info</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
              userVote === "TRUE_INFO" ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {trueVotes}
            </span>
          </Button>

          {/* False Info Button */}
          <Button
            type="button"
            size="sm"
            variant={userVote === "FALSE_INFO" ? "danger" : "outline"}
            onClick={() => handleVote("FALSE_INFO")}
            disabled={isSubmitting}
            className={`rounded-full px-4 text-xs gap-1.5 font-medium transition-all ${
              userVote === "FALSE_INFO"
                ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
                : "text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            }`}
          >
            <AlertTriangle size={14} className={userVote === "FALSE_INFO" ? "text-white" : "text-red-500"} />
            <span>Report False Info</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
              userVote === "FALSE_INFO" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {falseVotes}
            </span>
          </Button>
        </div>

        {/* Info note */}
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <Info size={12} className="text-gray-400 shrink-0" />
          <span>
            {falseVotes > 0 && !isAutoRejected ? (
              <span className="text-amber-700 font-medium">
                {reportsRemaining} more report{reportsRemaining === 1 ? "" : "s"} until auto-removal for review
              </span>
            ) : !user ? (
              <span>Sign in to vote or report</span>
            ) : userVote ? (
              <span>Click your selected vote to withdraw it</span>
            ) : (
              <span>8 false reports trigger auto-removal</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
