import { Category } from "@prisma/client";

export const CATEGORIES: Array<{
  name: Category;
  label: string;
  icon: string;
  order: number;
}> = [
  { name: Category.HEALTHCARE, label: "Healthcare & Medicine", icon: "HeartPulse", order: 1 },
  { name: Category.DISASTERS, label: "Disasters & Calamities", icon: "LifeBuoy", order: 2 },
  { name: Category.FOOD, label: "Food & Beverages", icon: "Utensils", order: 3 },
  { name: Category.CLOTHING, label: "Clothing & Apparel", icon: "Shirt", order: 4 },
  { name: Category.EDUCATION, label: "School & Education Supplies", icon: "GraduationCap", order: 5 },
  { name: Category.TOYS, label: "Toys & Recreational Items", icon: "Gamepad2", order: 6 },
  { name: Category.FURNITURE, label: "Household & Furniture", icon: "Armchair", order: 7 },
  { name: Category.HYGIENE, label: "Hygiene & Personal Care", icon: "Droplets", order: 8 },
  { name: Category.MONETARY, label: "Monetary Donations", icon: "HandCoins", order: 9 },
  { name: Category.MISCELLANEOUS, label: "Miscellaneous or Special Requests", icon: "Boxes", order: 10 },
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