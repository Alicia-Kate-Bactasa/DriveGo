import { Category } from "@prisma/client";
import { CategoryCard } from "./category-card";
import { CATEGORIES } from "@/lib/categories";

export function CategoryGrid() {
  const sorted = [...CATEGORIES].sort((a, b) => a.order - b.order);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">Explore Categories</h2>
        <p className="mt-3 text-center text-gray-600">
          Browse different types of donation drives to find the causes you care about.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((cat) => (
            <CategoryCard key={cat.name} category={cat.name} />
          ))}
        </div>
      </div>
    </section>
  );
}