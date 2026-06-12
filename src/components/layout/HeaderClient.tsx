"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { MobileNav, type NavLink } from "./MobileNav";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { createClient } from "@/lib/supabase/client";

export type HeaderUser = { name: string } | null;

const NAV_LINKS: NavLink[] = [
  { label: "Categories", href: "/#categories" },
  { label: "States", href: "/state" },
  { label: "Featured", href: "/#featured" },
  { label: "Compare", href: "/compare" },
  { label: "Search", href: "/search" },
  { label: "List your NGO", href: "/list-your-ngo" },
];

type HeaderClientProps = {
  user: HeaderUser;
};

/** Interactive header: brand, search, nav, auth controls, and mobile drawer. */
export function HeaderClient({ user }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

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

          {/* Auth controls */}
          <div className="ml-2 flex items-center gap-2 border-l border-ink-100 pl-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="max-w-[10rem] truncate rounded-full px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-100"
                >
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-60"
                >
                  <LogOut size={15} />
                  {loggingOut ? "…" : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
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
        footer={
          user ? (
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl bg-ink-50 px-3 py-2.5 text-sm font-medium text-ink-900"
              >
                {user.name}
              </Link>
              <button
                onClick={logout}
                disabled={loggingOut}
                className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-60"
              >
                <LogOut size={15} />
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl border border-ink-200 px-3 py-2.5 text-center text-sm font-medium text-ink-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Register
              </Link>
            </div>
          )
        }
      />
    </header>
  );
}
