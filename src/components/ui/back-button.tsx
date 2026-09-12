"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  fallbackHref = "/",
  label = "Go Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      setTimeout(() => {
        router.refresh();
      }, 50);
    } else {
      router.push(fallbackHref);
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 active:scale-95 ${className}`}
      aria-label={label}
    >
      <ArrowLeft
        size={16}
        className="text-gray-500 transition-transform group-hover:-translate-x-1 group-hover:text-gray-900"
      />
      <span>{label}</span>
    </button>
  );
}
