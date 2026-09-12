import React from "react";
import {
  HeartPulse,
  LifeBuoy,
  Utensils,
  Shirt,
  GraduationCap,
  Gamepad2,
  Armchair,
  Droplets,
  HandCoins,
  Boxes,
  LucideIcon,
  Package,
} from "lucide-react";
import { Category } from "@prisma/client";

export const CATEGORY_ICON_MAP: Record<Category, LucideIcon> = {
  [Category.HEALTHCARE]: HeartPulse,
  [Category.DISASTERS]: LifeBuoy,
  [Category.FOOD]: Utensils,
  [Category.CLOTHING]: Shirt,
  [Category.EDUCATION]: GraduationCap,
  [Category.TOYS]: Gamepad2,
  [Category.FURNITURE]: Armchair,
  [Category.HYGIENE]: Droplets,
  [Category.MONETARY]: HandCoins,
  [Category.MISCELLANEOUS]: Boxes,
};

export const CATEGORY_THEMES: Record<
  Category,
  {
    bg: string;
    text: string;
    hoverBg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  [Category.HEALTHCARE]: {
    bg: "bg-red-50",
    text: "text-red-600",
    hoverBg: "group-hover:bg-red-600 group-hover:text-white",
    border: "border-red-100",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
  [Category.DISASTERS]: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    hoverBg: "group-hover:bg-amber-600 group-hover:text-white",
    border: "border-amber-100",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  [Category.FOOD]: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    hoverBg: "group-hover:bg-orange-600 group-hover:text-white",
    border: "border-orange-100",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
  },
  [Category.CLOTHING]: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    hoverBg: "group-hover:bg-indigo-600 group-hover:text-white",
    border: "border-indigo-100",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
  },
  [Category.EDUCATION]: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    hoverBg: "group-hover:bg-blue-600 group-hover:text-white",
    border: "border-blue-100",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  [Category.TOYS]: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    hoverBg: "group-hover:bg-purple-600 group-hover:text-white",
    border: "border-purple-100",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
  },
  [Category.FURNITURE]: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    hoverBg: "group-hover:bg-teal-700 group-hover:text-white",
    border: "border-teal-100",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
  },
  [Category.HYGIENE]: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    hoverBg: "group-hover:bg-cyan-600 group-hover:text-white",
    border: "border-cyan-100",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
  },
  [Category.MONETARY]: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    hoverBg: "group-hover:bg-emerald-600 group-hover:text-white",
    border: "border-emerald-100",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  [Category.MISCELLANEOUS]: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    hoverBg: "group-hover:bg-gray-800 group-hover:text-white",
    border: "border-gray-200",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
};

export function getCategoryIconComponent(category: Category | string): LucideIcon {
  const cat = (typeof category === "string" ? category.toUpperCase() : category) as Category;
  return CATEGORY_ICON_MAP[cat] || Package;
}

export function CategoryIcon({
  category,
  size = 20,
  className = "",
  strokeWidth = 2,
}: {
  category: Category | string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = getCategoryIconComponent(category);
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
