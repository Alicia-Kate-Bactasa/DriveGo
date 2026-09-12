import { PageShell } from "@/components/layout/header-wrapper";
import { DriveListing } from "@/components/drive/drive-listing";
import { BackButton } from "@/components/ui/back-button";
import { CategoryIcon, CATEGORY_THEMES } from "@/components/category/category-icon";
import { prisma } from "@/lib/prisma";
import { Category, Status } from "@prisma/client";
import { getCategoryLabel, formatCategorySlug } from "@/lib/categories";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

  const theme = CATEGORY_THEMES[cat] || {
    bg: "bg-blue-50",
    text: "text-primary",
    hoverBg: "",
    border: "border-blue-100",
  };

  return (
    <PageShell hideHeader>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Go Back" />
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${theme.bg} ${theme.text} shadow-xs border ${theme.border}`}>
              <CategoryIcon category={cat} size={32} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {getCategoryLabel(cat)}
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Browse active {getCategoryLabel(cat).toLowerCase()} drives.
              </p>
            </div>
          </div>
        </div>
      </section>
      <DriveListing initialDrives={drives as any} category={cat} />
    </PageShell>
  );
}
