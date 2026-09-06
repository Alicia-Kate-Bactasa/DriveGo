import { MapPin, ShieldCheck, Users } from "lucide-react";
import { PageShell } from "@/components/layout/header-wrapper";
import { DriveCard } from "@/components/drive/drive-card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tag } from "@/components/ui/tag";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OrgProfilePage({ params }: Props) {
  const { slug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      drives: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { displayName: true } },
          organization: { select: { name: true, slug: true, verified: true } },
        },
      },
    },
  });

  if (!org) {
    notFound();
  }

  const followersCount = await prisma.follow.count({ where: { orgId: org.id } });

  return (
    <PageShell>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-primary shadow-md">
              {org.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
                {org.verified && (
                  <Tag className="gap-1">
                    <ShieldCheck size={11} /> Verified
                  </Tag>
                )}
              </div>
              {org.location && (
                <p className="flex items-center gap-1 text-gray-600">
                  <MapPin size={14} /> {org.location}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <Users size={13} />
                {followersCount} follower{followersCount !== 1 ? "s" : ""} ·{" "}
                {org.drives.length} active drive
                {org.drives.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {org.description && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">About</h2>
            <p className="mt-2 text-gray-700">{org.description}</p>
          </div>
        )}

        <h2 className="mt-8 text-2xl font-bold text-gray-900">Active Drives</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {org.drives.map((d: typeof org.drives[number]) => (
            <DriveCard
              key={d.id}
              {...d}
              endsAt={d.endsAt?.toISOString()}
            />
          ))}
        </div>

        {org.drives.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">
              No active drives yet from this organization.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
