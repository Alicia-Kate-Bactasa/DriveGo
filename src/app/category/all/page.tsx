import { PageShell } from "@/components/layout/header-wrapper";
import { DriveListing } from "@/components/drive/drive-listing";
import { BackButton } from "@/components/ui/back-button";
import { Boxes } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export const dynamic = "force-dynamic";

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
    <PageShell hideHeader>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Go Back" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-primary shadow-xs border border-blue-100">
              <Boxes size={32} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">All Donation Drives</h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Browse every active donation drive on DriveGo.
              </p>
            </div>
          </div>
        </div>
      </section>
      <DriveListing initialDrives={drives as any} />
    </PageShell>
  );
}
