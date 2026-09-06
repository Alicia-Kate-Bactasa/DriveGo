import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { name: "HEALTHCARE", label: "Healthcare & Medicine", icon: "capsule", order: 1 },
    { name: "DISASTERS", label: "Disasters & Calamities", icon: "tornado", order: 2 },
    { name: "FOOD", label: "Food & Beverages", icon: "fork-knife", order: 3 },
    { name: "CLOTHING", label: "Clothing & Apparel", icon: "basket2-fill", order: 4 },
    { name: "EDUCATION", label: "School & Education Supplies", icon: "journal-bookmark-fill", order: 5 },
    { name: "TOYS", label: "Toys & Recreational Items", icon: "archive-fill", order: 6 },
    { name: "FURNITURE", label: "Household & Furniture", icon: "house-add-fill", order: 7 },
    { name: "HYGIENE", label: "Hygiene & Personal Care", icon: "droplet-half", order: 8 },
    { name: "MONETARY", label: "Monetary Donations", icon: "cash-coin", order: 9 },
    { name: "MISCELLANEOUS", label: "Miscellaneous or Special Requests", icon: "bookmark-heart-fill", order: 10 },
  ];

  for (const cat of categories) {
    await prisma.categoryEntity.upsert({
      where: { name: cat.name as any },
      update: { label: cat.label, icon: cat.icon, order: cat.order },
      create: cat as any,
    });
  }

  console.log("Categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });