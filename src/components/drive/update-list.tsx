"use client";

import { useState } from "react";

type UpdateListProps = {
  driveId: string;
  initialUpdates: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date | string;
    author?: { displayName?: string | null } | null;
  }>;
};

export function UpdateList({ driveId, initialUpdates }: UpdateListProps) {
  const [updates] = useState(initialUpdates);

  if (updates.length === 0) {
    return (
      <p className="mt-3 text-sm text-gray-500">
        No updates yet. Check back later for progress.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-4">
      {updates.map((u) => (
        <div key={u.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{u.title}</h3>
            <span className="text-xs text-gray-500">
              {new Date(u.createdAt).toLocaleDateString()}
            </span>
          </div>
          {u.author && <p className="mt-1 text-xs text-gray-500">by {u.author.displayName}</p>}
          <p className="mt-2 text-sm text-gray-700">{u.body}</p>
        </div>
      ))}
    </div>
  );
}