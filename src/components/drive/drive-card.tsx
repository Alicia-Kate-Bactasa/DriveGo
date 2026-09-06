import Link from "next/link";
import { Category, Status } from "@prisma/client";
import { getCategoryLabel } from "@/lib/categories";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";

type DriveCardProps = {
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

export function DriveCard({
  id,
  title,
  summary,
  imageUrl,
  category,
  status,
  location,
  endsAt,
  progress = 0,
  donorsCount = 0,
  creator,
  organization,
}: DriveCardProps) {
  const endsAtDate = endsAt ? new Date(endsAt) : null;
  const isExpired = endsAtDate && endsAtDate < new Date();

  return (
    <Link href={`/drives/${id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
        <div className="relative h-44 bg-gradient-to-br from-brand-50 to-brand-100">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-brand-200">🎁</div>
          )}
          <div className="absolute left-3 top-3">
            <Badge>{getCategoryLabel(category)}</Badge>
          </div>
          {isExpired && <div className="absolute right-3 top-3"><Tag>Expired</Tag></div>}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-bold text-gray-900 group-hover:text-accent">{title}</h3>
          {summary && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{summary}</p>}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">📍 {location || "Online"}</span>
            {organization && (
              <span className="flex items-center gap-1">
                {organization.verified && <span>✓</span>}
                {organization.name}
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Progress</span>
              <span className="font-medium text-accent">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-1" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">{donorsCount} donors</span>
            {endsAtDate && !isExpired && (
              <Tag>Ends {endsAtDate.toLocaleDateString()}</Tag>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}