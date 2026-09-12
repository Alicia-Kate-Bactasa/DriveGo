"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category, Status } from "@prisma/client";
import { MapPin, BadgeCheck, ExternalLink, Globe, Calendar, ShieldCheck } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { DriveItem } from "./drive-item";
import { UpdateList } from "./update-list";
import { CommunityVeracity } from "./community-veracity";

type DriveDetailProps = {
  id: string;
  title: string;
  description: string;
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
  userVote?: "TRUE_INFO" | "FALSE_INFO" | null;
  createdAt?: Date | string | null;
  creator?: { displayName?: string | null; avatarUrl?: string | null } | null;
  organization?: { name?: string | null; slug?: string | null; verified?: boolean } | null;
  items?: Array<{
    id: string;
    name: string;
    description?: string | null;
    quantity?: number;
    unit?: string | null;
    urgency?: string | null;
  }>;
  updates?: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date | string;
    author?: { displayName?: string | null } | null;
  }>;
  isSaved?: boolean;
  isFollowing?: boolean;
};

export function DriveDetail({
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
  userVote = null,
  createdAt,
  creator,
  organization,
  items,
  updates,
}: DriveDetailProps) {
  const [imgError, setImgError] = useState(false);
  const endsAtDate = endsAt ? new Date(endsAt) : null;
  const isExpired = endsAtDate && endsAtDate < new Date();
  const isAutoRejected = falseVotesCount >= 8 || status === Status.REJECTED;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-[45px] border border-gray-100 bg-white shadow-sm">
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 lg:h-96">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              unoptimized
              onError={() => setImgError(true)}
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-blue-200">
              🎁
            </div>
          )}
          <div className="absolute left-4 top-4">
            <Badge className="inline-flex items-center gap-1.5 shadow-xs">
              <CategoryIcon category={category} size={15} strokeWidth={2.2} />
              <span>{getCategoryLabel(category)}</span>
            </Badge>
          </div>
          {isExpired && (
            <div className="absolute right-4 top-4">
              <Tag>Expired</Tag>
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {location || "Online"}
            </span>
            {organization && (
              <Link
                href={`/orgs/${organization.slug}`}
                className="flex items-center gap-1 transition hover:text-primary"
              >
                {organization.verified && (
                  <BadgeCheck size={14} className="text-primary" />
                )}
                {organization.name}
              </Link>
            )}
            {creator && <span>Posted by {creator.displayName}</span>}
          </div>

          {/* Prominent Official Campaign Post / External Link Card */}
          <div className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <ExternalLink size={18} />
                  <span>Original Campaign Post & Participation</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                  DriveGo serves as a central community directory for donation drives. To participate, coordinate donations, or contact the organizers, please visit the official drive post.
                </p>
              </div>

              {mediaUrl ? (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-md"
                >
                  <span>Visit Official Post</span>
                  <ExternalLink size={15} />
                </a>
              ) : (
                <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
                  No External Link Provided
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900">About This Drive</h2>
            <p className="mt-2 leading-relaxed text-gray-700 whitespace-pre-line">{description}</p>
            {summary && <p className="mt-2 text-gray-600">{summary}</p>}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Tag className="inline-flex items-center gap-1.5">
              <CategoryIcon category={category} size={13} strokeWidth={2} />
              <span>Category: {getCategoryLabel(category)}</span>
            </Tag>
            <Tag>Status: {status}</Tag>
            {endsAtDate && (
              <Tag>{isExpired ? "Campaign Expired" : `Ends ${endsAtDate.toLocaleDateString()}`}</Tag>
            )}
          </div>
        </div>
      </div>

      {/* Community Veracity Fact-Checking Section */}
      <div className="mt-6">
        <CommunityVeracity
          driveId={id}
          initialTrueVotes={trueVotesCount}
          initialFalseVotes={falseVotesCount}
          initialUserVote={userVote}
          adminReviewed={adminReviewed}
          status={status}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Accepted Items</h2>
          <div className="mt-3 space-y-3">
            {items && items.length > 0 ? (
              items.map((item) => <DriveItem key={item.id} {...item} />)
            ) : (
              <p className="text-sm text-gray-500">
                No specific items listed. Refer to the official post or description for details.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[36px] border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900">Campaign Details</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium text-gray-900">
                  {getCategoryLabel(category)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Starts</dt>
                <dd className="font-medium text-gray-900">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Ends</dt>
                <dd className="font-medium text-gray-900">
                  {endsAtDate ? endsAtDate.toLocaleDateString() : "Ongoing"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fact-Check</dt>
                <dd className="font-medium text-gray-900">
                  {adminReviewed ? (
                    <span className="text-emerald-700 font-semibold">Admin Verified</span>
                  ) : isAutoRejected ? (
                    <span className="text-red-600 font-semibold">Under Review</span>
                  ) : trueVotesCount > 0 ? (
                    <span className="text-emerald-600">{trueVotesCount} verified</span>
                  ) : (
                    "Community Review"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[36px] border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900">Organizer</h3>
            {organization ? (
              <Link
                href={`/orgs/${organization.slug}`}
                className="mt-3 flex items-center gap-3 transition hover:text-primary"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-primary">
                  {organization.name?.[0] || "O"}
                </span>
                <div>
                  <p className="flex items-center gap-1 font-medium text-gray-900">
                    {organization.name}
                    {organization.verified && (
                      <BadgeCheck size={14} className="text-primary" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Verified organization</p>
                </div>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Individual organizer</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900">Campaign Updates</h2>
        <UpdateList driveId={id} initialUpdates={updates || []} />
      </div>
    </div>
  );
}
