"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useUser } from "@/hooks/use-user";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useSubmitModal } from "@/components/drive/submit-modal-context";

const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#categories", label: "Categories" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { openSubmitModal } = useSubmitModal();

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
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
    return (
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    );
  }

  return (
    <>
      <header className="sticky top-3 sm:top-3.5 z-50 mx-auto w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-[1536px] -mb-16 sm:-mb-18">
        <div className="flex min-h-[58px] sm:min-h-[66px] items-center justify-between rounded-[45px] border border-white/40 bg-white/75 px-5 py-2.5 sm:px-7 sm:py-3 shadow-lg shadow-black/5 backdrop-blur-xl transition-all">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-gray-900 transition hover:text-primary sm:text-2xl"
          >
            DriveGo
          </Link>

          {/* Desktop nav */}
          <nav className="hidden gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === "/" && link.href === "/#home";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-black/5 hover:text-gray-950"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50/90 border border-blue-200 hover:bg-blue-100 transition shadow-2xs"
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
                  className="rounded-full text-gray-600 hover:text-red-600 px-3 py-1.5"
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
                className="rounded-full px-3.5 py-1.5 text-sm font-medium"
              >
                Log in
              </Button>
            )}

            <Button onClick={openSubmitModal} size="sm" variant="primary" className="rounded-full px-4 py-2 shadow-xs">
              Submit a Drive
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="rounded-full p-2 text-gray-600 transition hover:bg-black/5 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav floating dropdown */}
        {menuOpen && (
          <nav className="mt-3 overflow-hidden rounded-[36px] border border-white/35 bg-white/80 p-5 shadow-2xl backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
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

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
