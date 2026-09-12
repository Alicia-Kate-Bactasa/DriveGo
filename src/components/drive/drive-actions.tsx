"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { saveDrive, unsaveDrive, followDrive, unfollowDrive } from "./actions";

type DriveActionsProps = {
  driveId: string;
};

export function DriveActions({ driveId }: DriveActionsProps) {
  const { user, loading } = useUser();
  const { openAuthModal } = useAuthModal();
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return null;

  const handleSave = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await unsaveDrive(driveId);
        setSaved(false);
      } else {
        await saveDrive(driveId);
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setBusy(true);
    try {
      if (following) {
        await unfollowDrive(driveId);
        setFollowing(false);
      } else {
        await followDrive(driveId);
        setFollowing(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={saved ? "outline" : "primary"} onClick={handleSave} disabled={busy}>
          {saved ? "✓ Saved" : "Save Drive"}
        </Button>
        <Button size="sm" variant={following ? "outline" : "ghost"} onClick={handleFollow} disabled={busy}>
          {following ? "✓ Following" : "Follow Drive"}
        </Button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Eye size={14} className="text-gray-400" />
        <span>Public community drive • Free to view and share</span>
      </div>
    </div>
  );
}