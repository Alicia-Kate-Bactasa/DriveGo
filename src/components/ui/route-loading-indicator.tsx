"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingScreen } from "./loading-screen";

function RouteLoadingInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Turn off loading once pathname or search params change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Catch link clicks to show loading screen immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Ignore external links, mailto, tel, downloads, or new-tab links
      if (
        !href ||
        targetAttr === "_blank" ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Ignore hash anchors on the same page (e.g., #categories, #home)
      if (href.startsWith("#")) {
        return;
      }

      // Ignore same page hash links like /#categories if already on /
      if (href.includes("#")) {
        const [targetPath] = href.split("#");
        if (targetPath === "" || targetPath === pathname) {
          return;
        }
      }

      // If clicking current route with no hash, do nothing
      if (href === pathname) {
        return;
      }

      // Show the cute loading overlay
      setIsLoading(true);
    };

    // Failsafe timeout so it never stays stuck indefinitely
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 7000);
    }

    document.addEventListener("click", handleLinkClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      if (timer) clearTimeout(timer);
    };
  }, [pathname, isLoading]);

  if (!isLoading) return null;

  return <LoadingScreen fullPage />;
}

export function RouteLoadingOverlay() {
  return (
    <Suspense fallback={null}>
      <RouteLoadingInner />
    </Suspense>
  );
}
