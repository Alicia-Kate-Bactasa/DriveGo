import { PageShell } from "@/components/layout/header-wrapper";
import { DriveListing } from "@/components/drive/drive-listing";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export default async function AllDrivesPage() {
  const drives = await prisma.drive.findMany({
    where: { status: Status.ACTIVE },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: { select: { displayName: true } },
      organization: { select: { name: true, slug: true, verified: true } },
    },
  });

  return (
    <PageShell>
      <section className="bg-brand-50 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">All Donation Drives</h1>
          <p className="mt-2 text-gray-600">Browse every active donation drive on DriveGo.</p>
        </div>
      </section>
      <DriveListing initialDrives={drives as any} />
    </PageShell>
  );
}