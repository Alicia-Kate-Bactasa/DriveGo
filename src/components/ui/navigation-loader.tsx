"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Turn off loading once pathname or searchParams change
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept internal link clicks across all pages
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Find closest anchor tag
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Ignore hash links (e.g. /#home, /#about, #categories) when on the same page
      if (href.includes("#")) {
        const [targetPath] = href.split("#");
        if (!targetPath || targetPath === window.location.pathname) {
          return;
        }
      }

      const currentPath = window.location.pathname + window.location.search;
      if (href !== currentPath) {
        setIsNavigating(true);
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-xs transition-opacity duration-150 pointer-events-auto"
    >
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[2.5px] border-gray-200 border-t-primary" />
        <p className="text-xs font-medium text-gray-500 select-none">Loading...</p>
      </div>
    </div>
  );
}
