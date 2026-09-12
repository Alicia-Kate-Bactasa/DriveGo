import { Category } from "@prisma/client";
import { CategoryCard } from "./category-card";
import { CATEGORIES } from "@/lib/categories";

export function CategoryGrid() {
  const sorted = [...CATEGORIES].sort((a, b) => a.order - b.order);

  return (
    <section id="categories" className="py-14 sm:py-16 lg:py-20 scroll-mt-20 relative">
      {/* Anchor for backwards compatibility with #services */}
      <div id="services" className="sr-only" />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900">
          Explore Categories
        </h2>
        <p className="mt-2.5 text-center text-gray-600 max-w-xl mx-auto">
          Browse different types of donation drives to find the causes you care
          about.
        </p>
        <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <CategoryCard isAllDrives />
          {sorted.map((cat) => (
            <CategoryCard key={cat.name} category={cat.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
