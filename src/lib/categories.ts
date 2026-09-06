import { Category } from "@prisma/client";

export const CATEGORIES: Array<{
  name: Category;
  label: string;
  icon: string;
  order: number;
}> = [
  { name: Category.HEALTHCARE, label: "Healthcare & Medicine", icon: "capsule", order: 1 },
  { name: Category.DISASTERS, label: "Disasters & Calamities", icon: "tornado", order: 2 },
  { name: Category.FOOD, label: "Food & Beverages", icon: "fork-knife", order:3 },
  { name: Category.CLOTHING, label: "Clothing & Apparel", icon: "basket2-fill", order: 4 },
  { name: Category.EDUCATION, label: "School & Education Supplies", icon: "journal-bookmark-fill", order: 5 },
  { name: Category.TOYS, label: "Toys & Recreational Items", icon: "archive-fill", order: 6 },
  { name: Category.FURNITURE, label: "Household & Furniture", icon: "house-add-fill", order: 7 },
  { name: Category.HYGIENE, label: "Hygiene & Personal Care", icon: "droplet-half", order: 8 },
  { name: Category.MONETARY, label: "Monetary Donations", icon: "cash-coin", order: 9 },
  { name: Category.MISCELLANEOUS, label: "Miscellaneous or Special Requests", icon: "bookmark-heart-fill", order: 10 },
];

export function getCategoryLabel(category: Category | string): string {
  const found = CATEGORIES.find((c) => c.name === category);
  return found ? found.label : "Drive";
}

export function getCategoryIcon(category: Category | string): string {
  const found = CATEGORIES.find((c) => c.name === category);
  return found ? found.icon : "archive";
}

export function formatCategorySlug(slug: string): Category {
  const upper = slug.toUpperCase() as Category;
  return CATEGORIES.some((c) => c.name === upper) ? upper : Category.MISCELLANEOUS;
}