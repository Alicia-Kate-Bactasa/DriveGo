import { Category } from "@prisma/client";
import { CategoryCard } from "./category-card";
import { CATEGORIES } from "@/lib/categories";

export function CategoryGrid() {
  const sorted = [...CATEGORIES].sort((a, b) => a.order - b.order);

  return (
    <section id="services" className="relative flex min-h-[85vh] lg:min-h-[92vh] flex-col justify-center py-20 lg:py-28 scroll-mt-16">
      <div className="mx-auto my-auto w-full max-w-7xl px-4 lg:px-8">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900">
          Explore Categories
        </h2>
        <p className="mt-3 text-center text-gray-600 max-w-xl mx-auto">
          Browse different types of donation drives to find the causes you care
          about.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {sorted.map((cat) => (
            <CategoryCard key={cat.name} category={cat.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
