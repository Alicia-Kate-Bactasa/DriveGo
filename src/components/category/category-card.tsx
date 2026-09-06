import Link from "next/link";
import { Category } from "@prisma/client";
import { getCategoryLabel } from "@/lib/categories";

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.toLowerCase()}`}
      className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-accent">
        <span className="text-2xl">📦</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{getCategoryLabel(category)}</h3>
      <span className="mt-1 text-xs font-medium text-accent">View Drives →</span>
    </Link>
  );
}