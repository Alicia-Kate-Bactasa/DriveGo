"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/category/healthcare", label: "Healthcare" },
  { href: "/category/food", label: "Food" },
  { href: "/category/education", label: "Education" },
  { href: "/category/clothing", label: "Clothing" },
  { href: "/saved", label: "Saved" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link
          href="/"
          className="text-3xl font-bold text-gray-900 transition hover:text-primary"
        >
          DriveGo
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-base font-medium transition ${
                  isActive
                    ? "text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LinkButton href="/submit" size="sm" variant="outline">
            Submit a Drive
          </LinkButton>

          {/* Mobile menu button */}
          <button
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-base font-medium text-gray-700 transition hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
