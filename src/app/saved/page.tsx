import { Bookmark, BookmarkX } from "lucide-react";
import { PageShell } from "@/components/layout/header-wrapper";
import { DriveCard } from "@/components/drive/drive-card";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { BackButton } from "@/components/ui/back-button";

export default async function SavedDrivesPage() {
  const user = await requireAuth();

  const saved = await prisma.savedDrive.findMany({
    where: { userId: user.id },
    include: {
      drive: {
        include: {
          creator: { select: { displayName: true } },
          organization: { select: { name: true, slug: true, verified: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white pt-20 pb-10 sm:pt-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-4">
            <BackButton fallbackHref="/" label="Go Back" />
          </div>
          <h1 className="flex items-center gap-3 text-4xl font-bold text-gray-900">
            <Bookmark size={32} className="text-primary" /> Saved Drives
          </h1>
          <p className="mt-2 text-gray-600">
            The donation drives you&apos;ve bookmarked.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <BookmarkX size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">You haven&apos;t saved any drives yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s: typeof saved[number]) => (
              <DriveCard
                key={s.id}
                {...s.drive}
                endsAt={s.drive.endsAt?.toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
