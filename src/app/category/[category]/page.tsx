import { PageShell } from "@/components/layout/header-wrapper";
import { DriveListing } from "@/components/drive/drive-listing";
import { prisma } from "@/lib/prisma";
import { Category, Status } from "@prisma/client";
import { getCategoryLabel, formatCategorySlug } from "@/lib/categories";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const label = getCategoryLabel(category.toUpperCase() as Category);
  return { title: `${label} — DriveGo` };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = formatCategorySlug(category);

  const drives = await prisma.drive.findMany({
    where: { category: cat, status: Status.ACTIVE },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: { select: { displayName: true } },
      organization: { select: { name: true, slug: true, verified: true } },
    },
  });

  return (
    <PageShell>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {getCategoryLabel(cat)}
          </h1>
          <p className="mt-2 text-gray-600">
            Browse active {getCategoryLabel(cat).toLowerCase()} drives.
          </p>
        </div>
      </section>
      <DriveListing initialDrives={drives as any} category={cat} />
    </PageShell>
  );
}
