import Link from "next/link";
import { Category, Status } from "@prisma/client";
import { getCategoryLabel } from "@/lib/categories";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { DriveItem } from "./drive-item";
import { UpdateList } from "./update-list";

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
  progress = 0,
  donorsCount = 0,
  createdAt,
  creator,
  organization,
  items,
  updates,
  isSaved,
  isFollowing,
}: DriveDetailProps) {
  const endsAtDate = endsAt ? new Date(endsAt) : null;
  const isExpired = endsAtDate && endsAtDate < new Date();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-72 bg-gradient-to-br from-brand-50 to-brand-100">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-brand-200">🎁</div>
          )}
          <div className="absolute left-4 top-4">
            <Badge>{getCategoryLabel(category)}</Badge>
          </div>
          {isExpired && (
            <div className="absolute right-4 top-4">
              <Tag>Expired</Tag>
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span>📍 {location || "Online"}</span>
            {organization && (
              <Link href={`/orgs/${organization.slug}`} className="flex items-center gap-1 hover:text-accent">
                {organization.verified && <span>✓</span>}
                {organization.name}
              </Link>
            )}
            {creator && <span>Posted by {creator.displayName}</span>}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Campaign Progress</span>
              <span className="font-bold text-accent">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-2" />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{donorsCount} donors</span>
              {endsAtDate && !isExpired && <Tag>Ends {endsAtDate.toLocaleString()}</Tag>}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900">About This Drive</h2>
            <p className="mt-2 text-gray-700 leading-relaxed">{description}</p>
            {summary && <p className="mt-2 text-gray-600">{summary}</p>}
          </div>

          {mediaUrl && (
            <div className="mt-4">
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:underline"
              >
                📎 View original source
              </a>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Tag>Category: {getCategoryLabel(category)}</Tag>
            <Tag>Status: {status}</Tag>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Accepted Items</h2>
          <div className="mt-3 space-y-3">
            {items && items.length > 0 ? (
              items.map((item) => <DriveItem key={item.id} {...item} />)
            ) : (
              <p className="text-sm text-gray-500">No specific items listed. Contact the organizer for details.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-gray-900">Campaign Details</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium text-gray-900">{getCategoryLabel(category)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Starts</dt>
                <dd className="font-medium text-gray-900">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Ends</dt>
                <dd className="font-medium text-gray-900">
                  {endsAtDate ? endsAtDate.toLocaleDateString() : "Ongoing"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Donors</dt>
                <dd className="font-medium text-gray-900">{donorsCount}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-gray-900">Organizer</h3>
            {organization ? (
              <Link href={`/orgs/${organization.slug}`} className="mt-2 flex items-center gap-2 hover:text-accent">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-accent">
                  {organization.name?.[0] || "O"}
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    {organization.name} {organization.verified && "✓"}
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