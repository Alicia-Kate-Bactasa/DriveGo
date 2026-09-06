import { memo } from "react";
import Link from "next/link";
import { Category } from "@prisma/client";
import { Package, ArrowRight } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";

type CategoryCardProps = {
  category: Category;
};

export const CategoryCard = memo(function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.toLowerCase()}`}
      className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Package size={26} strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{getCategoryLabel(category)}</h3>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
        View Drives <ArrowRight size={12} />
      </span>
    </Link>
  );
});
