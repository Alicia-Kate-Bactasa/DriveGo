"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useUser } from "@/hooks/use-user";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useSubmitModal } from "@/components/drive/submit-modal-context";

const PUBLIC_NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#categories", label: "Categories" },
];

const AUTH_NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/category/all", label: "Explore Causes" },
  { href: "/saved", label: "Saved Drives" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { openSubmitModal } = useSubmitModal();
  const { openAuthModal } = useAuthModal();

  const NAV_LINKS = user ? AUTH_NAV_LINKS : PUBLIC_NAV_LINKS;

  const openAuth = (mode: "login" | "signup") => {
    openAuthModal(mode);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.refresh();
  };

  // Hide header completely on category pages
  const isCategoryPage = pathname?.startsWith("/category");

  if (isCategoryPage) {
    return null;
  }

  return (
    <>
      <header className="sticky top-3 sm:top-4 z-50 mx-auto w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-[1536px] -mb-20 sm:-mb-24">
        <div className="relative flex min-h-[74px] sm:min-h-[84px] items-center justify-between rounded-[50px] border border-gray-100 bg-white px-6 sm:px-9 py-3 sm:py-4 shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:border-gray-200">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-primary transition-all duration-200 hover:opacity-85 hover:scale-[1.02] sm:text-2xl shrink-0"
          >
            DriveGo
          </Link>

          {/* Desktop nav - Perfectly centered */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (pathname === "/" && link.href.includes("#")) {
                    e.preventDefault();
                    const id = link.href.split("#")[1];
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    } else if (id === "home") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }
                }}
                className="relative rounded-full px-4 py-1.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-primary active:scale-95 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-2xs"
                  title="Admin Dashboard"
                >
                  Admin
                </Link>
                <span className="hidden text-sm font-medium text-gray-700 sm:inline-block">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </span>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 transition-all"
                >
                  <LogOut size={15} className="mr-1 sm:inline" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => openAuth("login")}
                size="sm"
                variant="ghost"
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-primary"
              >
                Log in
              </Button>
            )}

            <Button
              onClick={openSubmitModal}
              size="sm"
              variant="primary"
              className="rounded-full px-4 py-2 shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
            >
              Submit a Drive
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="rounded-full p-2 text-gray-600 transition hover:bg-blue-50 hover:text-primary md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav floating dropdown */}
        {menuOpen && (
          <nav className="mt-3 overflow-hidden rounded-[36px] border border-gray-100 bg-white p-5 shadow-2xl md:hidden">
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-primary cursor-pointer"
                  onClick={(e) => {
                    setMenuOpen(false);
                    if (pathname === "/" && link.href.includes("#")) {
                      e.preventDefault();
                      const id = link.href.split("#")[1];
                      const el = document.getElementById(id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      } else if (id === "home") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }
                  }}
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    openSubmitModal();
                  }}
                  size="sm"
                  variant="primary"
                  className="w-full rounded-full"
                >
                  Submit a Drive
                </Button>

                {user ? (
                  <>
                    <Link
                      href="/admin"
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      size="sm"
                      variant="outline"
                      className="w-full rounded-full text-red-600"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => openAuth("login")}
                      size="sm"
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      Log in
                    </Button>
                    <Button
                      onClick={() => openAuth("signup")}
                      size="sm"
                      className="w-full rounded-full"
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
