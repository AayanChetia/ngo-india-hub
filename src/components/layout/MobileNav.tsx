"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavLink = { label: string; href: string };

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  /** Optional content rendered at the bottom of the drawer (e.g. auth controls). */
  footer?: ReactNode;
};

/**
 * Slide-over navigation drawer for small screens.
 *
 * Rendered through a portal to <body> so it escapes the header's stacking
 * context (the header uses backdrop-blur, which would otherwise trap this
 * overlay below other fixed elements like the chat widget).
 */
export function MobileNav({ open, onClose, links, footer }: MobileNavProps) {
  const [mounted, setMounted] = useState(false);

  // Portals require the DOM — only render after mount to stay SSR-safe.
  useEffect(() => setMounted(true), []);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      {/* Backdrop — solid dark overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Panel — opaque white drawer sliding in from the right */}
      <nav
        className={cn(
          "absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <span className="text-base font-semibold text-ink-900">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-ink-700 hover:bg-ink-100 hover:text-ink-900"
          >
            <X size={22} />
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

        {footer && (
          <div className="mt-auto border-t border-ink-100 p-3">{footer}</div>
        )}
      </nav>
    </div>,
    document.body
  );
}
