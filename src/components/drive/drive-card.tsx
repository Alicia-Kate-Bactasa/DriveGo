import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category, Status } from "@prisma/client";
import { MapPin, BadgeCheck } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";
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

export const DriveCard = memo(function DriveCard({
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
      <div className="overflow-hidden rounded-[45px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
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
          {isExpired && (
            <div className="absolute right-3 top-3">
              <Tag>Expired</Tag>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-primary">
            {title}
          </h3>
          {summary && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{summary}</p>
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

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Progress</span>
              <span className="font-semibold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="mt-1.5" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {donorsCount} {donorsCount === 1 ? "donor" : "donors"}
            </span>
            {endsAtDate && !isExpired && (
              <Tag>Ends {endsAtDate.toLocaleDateString()}</Tag>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
