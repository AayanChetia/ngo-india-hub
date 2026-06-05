"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { MobileNav, type NavLink } from "./MobileNav";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

const NAV_LINKS: NavLink[] = [
  { label: "Categories", href: "/#categories" },
  { label: "States", href: "/state" },
  { label: "Featured", href: "/#featured" },
  { label: "Search", href: "/search" },
];

/** Sticky site header with brand, primary nav, search, and mobile drawer. */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 shadow-sm backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            NG
          </span>
          <span className="hidden text-base font-semibold text-ink-900 sm:block">
            NGO India Hub
          </span>
        </Link>

        {/* Desktop search — same live autocomplete as the homepage */}
        <div className="hidden flex-1 md:block">
          <SearchAutocomplete size="md" showButton={false} />
        </div>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="ml-auto rounded-full p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
        >
          <Menu size={22} />
        </button>
      </div>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
      />
    </header>
  );
}
