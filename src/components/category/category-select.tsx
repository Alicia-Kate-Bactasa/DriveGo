"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import { CategoryIcon, CATEGORY_THEMES } from "@/components/category/category-icon";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
};

export function CategorySelect({
  value,
  onChange,
  name = "category",
  required = false,
  className = "",
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory =
    CATEGORIES.find((c) => c.name === value) || CATEGORIES[0];
  const selectedTheme =
    CATEGORY_THEMES[selectedCategory.name as Category] ||
    CATEGORY_THEMES[Category.MISCELLANEOUS];

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for standard form data handling */}
      <input
        type="hidden"
        name={name}
        value={selectedCategory.name}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-3 rounded-[45px] border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 outline-none ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/5"
            : "border-gray-200 hover:border-gray-300 hover:shadow-xs"
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0 truncate">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${selectedTheme.bg} ${selectedTheme.text}`}
          >
            <CategoryIcon
              category={selectedCategory.name}
              size={15}
              strokeWidth={2.2}
            />
          </span>
          <span className="truncate font-medium text-gray-800">
            {selectedCategory.label}
          </span>
        </span>

        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "group-hover:text-gray-600"
          }`}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {/* Scrollable Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-56 overflow-y-auto rounded-[24px] border border-gray-100 bg-white p-1.5 shadow-xl shadow-blue-950/10 focus:outline-none overscroll-contain animate-in fade-in-50 zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = cat.name === selectedCategory.name;
            const theme =
              CATEGORY_THEMES[cat.name as Category] ||
              CATEGORY_THEMES[Category.MISCELLANEOUS];

            return (
              <button
                key={cat.name}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(cat.name);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between gap-3 rounded-[18px] px-3 py-2 text-left text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? "bg-blue-50 text-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0 truncate">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-150 group-hover:scale-105 ${theme.bg} ${theme.text}`}
                  >
                    <CategoryIcon
                      category={cat.name}
                      size={14}
                      strokeWidth={2.2}
                    />
                  </span>
                  <span className="truncate">{cat.label}</span>
                </span>

                {isSelected && (
                  <Check
                    size={16}
                    className="shrink-0 text-primary animate-in fade-in"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
