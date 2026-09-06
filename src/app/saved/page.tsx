import { PageShell } from "@/components/layout/header-wrapper";
import { DriveCard } from "@/components/drive/drive-card";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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
      <section className="bg-brand-50 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Saved Drives</h1>
          <p className="mt-2 text-gray-600">The donation drives you&apos;ve bookmarked.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">You haven&apos;t saved any drives yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s) => (
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