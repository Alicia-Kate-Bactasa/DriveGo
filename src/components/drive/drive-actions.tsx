"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { saveDrive, unsaveDrive, followDrive, unfollowDrive } from "./actions";

type DriveActionsProps = {
  driveId: string;
};

export function DriveActions({ driveId }: DriveActionsProps) {
  const { user, loading } = useUser();
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return null;

  const handleSave = async () => {
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
    <div className="mb-6 flex flex-wrap gap-3">
      <Button size="sm" variant={saved ? "outline" : "primary"} onClick={handleSave} disabled={busy}>
        {saved ? "✓ Saved" : "Save Drive"}
      </Button>
      <Button size="sm" variant={following ? "outline" : "ghost"} onClick={handleFollow} disabled={busy}>
        {following ? "✓ Following" : "Follow Drive"}
      </Button>
    </div>
  );
}