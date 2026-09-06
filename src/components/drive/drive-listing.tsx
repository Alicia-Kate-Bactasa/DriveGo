"use client";

import { useState } from "react";
import { Category, Status } from "@prisma/client";
import { DriveCard } from "./drive-card";
import { Button } from "@/components/ui/button";

type Drive = {
  id: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  category: Category;
  status: Status;
  location?: string | null;
  endsAt?: Date | string | null;
  progress?: number;
  donorsCount?: number;
  creator?: { displayName?: string | null };
  organization?: { name?: string | null; verified?: boolean } | null;
};

type DriveListingProps = {
  initialDrives: Drive[];
  category?: string;
};

export function DriveListing({ initialDrives, category }: DriveListingProps) {
  const [drives] = useState(initialDrives);
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "FUNDED" | "EXPIRED">("ACTIVE");

  const filtered = drives.filter((d) => d.status === statusFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          {category ? "Drives" : "All Drives"}
        </h2>
        <div className="flex gap-2">
          {(["ACTIVE", "FUNDED", "EXPIRED"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "primary" : "outline"}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No drives found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((drive) => (
            <DriveCard key={drive.id} {...drive} />
          ))}
        </div>
      )}
    </div>
  );
}