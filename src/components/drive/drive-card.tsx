"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { Category, Status } from "@prisma/client";
import { MapPin, BadgeCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { useDriveModal } from "./drive-modal-context";

type DriveCardProps = {
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
  progress?: number;
  donorsCount?: number;
  trueVotesCount?: number;
  falseVotesCount?: number;
  adminReviewed?: boolean;
  creatorId?: string | null;
  creator?: { displayName?: string | null };
  organization?: { name?: string | null; verified?: boolean } | null;
};

export const DriveCard = memo(function DriveCard({
  id,
  title,
  description,
  summary,
  imageUrl,
  mediaUrl,
  category,
  status,
  location,
  endsAt,
  trueVotesCount = 0,
  falseVotesCount = 0,
  adminReviewed = false,
  creatorId,
  creator,
  organization,
}: DriveCardProps) {
  const { openDriveModal } = useDriveModal();
  const [imgError, setImgError] = useState(false);
  const endsAtDate = endsAt ? new Date(endsAt) : null;
  const isExpired = endsAtDate && endsAtDate < new Date();
  const isAutoRejected = falseVotesCount >= 8 || status === Status.REJECTED;

  const handleClick = () => {
    openDriveModal({
      id,
      title,
      description: description || summary,
      summary,
      imageUrl,
      mediaUrl,
      category,
      status,
      location,
      endsAt,
      trueVotesCount,
      falseVotesCount,
      adminReviewed,
      creatorId,
      creator,
      organization,
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group block cursor-pointer text-left focus:outline-hidden"
    >
      <div className="overflow-hidden rounded-[45px] border border-gray-100 bg-white shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col h-full">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              onError={() => setImgError(true)}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-blue-200">
              🎁
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge className="inline-flex items-center gap-1.5 shadow-xs">
              <CategoryIcon category={category} size={13} strokeWidth={2.5} />
              <span>{getCategoryLabel(category)}</span>
            </Badge>
          </div>
          {isAutoRejected && (
            <div className="absolute right-3 top-3">
              <Tag className="border-red-200 bg-red-50 text-red-700 font-bold">
                Under Review
              </Tag>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-primary">
              {title}
            </h3>
            {(summary || description) && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {summary || description}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {location || "Online"}
              </span>
              {organization && (
                <span className="flex items-center gap-1">
                  {organization.verified && (
                    <BadgeCheck size={12} className="text-primary" />
                  )}
                  {organization.name}
                </span>
              )}
            </div>
          </div>

          {/* Community Veracity & Campaign Info Status */}
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
            {/* Veracity count visible to everyone */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  trueVotesCount > 0 ? "text-emerald-700" : "text-gray-400"
                }`}
                title={`${trueVotesCount} community members verified as true info`}
              >
                <CheckCircle2
                  size={13}
                  className={trueVotesCount > 0 ? "text-emerald-600" : "text-gray-300"}
                />
                {trueVotesCount}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  falseVotesCount > 0 ? "text-amber-700" : "text-gray-400"
                }`}
                title={`${falseVotesCount} community members reported as false info`}
              >
                <AlertTriangle
                  size={13}
                  className={falseVotesCount > 0 ? "text-amber-500" : "text-gray-300"}
                />
                {falseVotesCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
