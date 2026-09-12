import { memo } from "react";
import Link from "next/link";
import { Category } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import { CategoryIcon, CATEGORY_THEMES } from "./category-icon";

type CategoryCardProps = {
  category: Category;
};

export const CategoryCard = memo(function CategoryCard({ category }: CategoryCardProps) {
  const theme = CATEGORY_THEMES[category] || {
    bg: "bg-blue-50",
    text: "text-primary",
    hoverBg: "group-hover:bg-primary group-hover:text-white",
    border: "border-gray-100",
  };

  return (
    <Link
      href={`/category/${category.toLowerCase()}`}
      className="group flex flex-col items-center rounded-[45px] border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`mb-3.5 flex h-16 w-16 items-center justify-center rounded-[28px] ${theme.bg} ${theme.text} transition-colors duration-300 ${theme.hoverBg} shadow-xs`}
      >
        <CategoryIcon category={category} size={28} strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
        {getCategoryLabel(category)}
      </h3>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
        View Drives <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
});
