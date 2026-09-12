import { PageShell } from "@/components/layout/header-wrapper";
import { DriveDetail } from "@/components/drive/drive-detail";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DriveActions } from "@/components/drive/drive-actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DrivePage({ params }: Props) {
  const { id } = await params;

  const drive = await prisma.drive.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, displayName: true, avatarUrl: true } },
      organization: { select: { name: true, slug: true, verified: true } },
      items: { orderBy: { createdAt: "asc" } },
      updates: {
        include: { author: { select: { displayName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!drive) {
    notFound();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-12 sm:pt-32 lg:px-8">
        <DriveActions driveId={drive.id} />
        <DriveDetail
          id={drive.id}
          title={drive.title}
          description={drive.description}
          summary={drive.summary}
          imageUrl={drive.imageUrl}
          mediaUrl={drive.mediaUrl}
          category={drive.category}
          status={drive.status}
          location={drive.location}
          endsAt={drive.endsAt}
          progress={drive.progress}
          donorsCount={drive.donorsCount}
          createdAt={drive.createdAt}
          creator={drive.creator}
          organization={drive.organization}
          items={drive.items}
          updates={drive.updates}
        />
      </div>
    </PageShell>
  );
}