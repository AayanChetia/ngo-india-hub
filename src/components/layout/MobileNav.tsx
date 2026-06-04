"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavLink = { label: string; href: string };

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
};

/** Slide-over navigation drawer for small screens. */
export function MobileNav({ open, onClose, links }: MobileNavProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-ink-900/40 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <nav
        className={cn(
          "absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <span className="font-semibold text-ink-900">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-primary-50 hover:text-primary-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
