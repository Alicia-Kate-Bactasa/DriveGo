"use client";

import { useState, useMemo } from "react";
import { Category, Status } from "@prisma/client";
import { PackageSearch, Sparkles } from "lucide-react";
import { DriveCard } from "./drive-card";
import { Button } from "@/components/ui/button";
import { useSubmitModal } from "@/components/drive/submit-modal-context";

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
  const { openSubmitModal } = useSubmitModal();

  const filtered = useMemo(
    () => drives.filter((d) => d.status === statusFilter),
    [drives, statusFilter]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Community invitation banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 p-5 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2 text-primary shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Looking to rally support for a cause?
            </p>
            <p className="text-xs text-gray-600">
              Anyone can explore and share drives freely. When you&apos;re ready to organize your own, sign in to launch it.
            </p>
          </div>
        </div>
        <Button
          onClick={openSubmitModal}
          size="sm"
          variant="outline"
          className="shrink-0 self-start sm:self-auto border-blue-200 text-primary hover:bg-blue-50"
        >
          Submit a Drive
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          {category ? "Drives" : "All Drives"}
        </h2>
        <div className="flex gap-2">
          {(
            [
              { value: "ACTIVE", label: "Active" },
              { value: "FUNDED", label: "Funded" },
              { value: "EXPIRED", label: "Expired" },
            ] as const
          ).map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? "primary" : "outline"}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <PackageSearch size={48} className="mx-auto mb-4 text-gray-300" />
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
