"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  HandHeart,
  Users,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ngos", label: "NGOs", icon: Building2 },
  { href: "/admin/applications", label: "Applications", icon: HandHeart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-ink-100 bg-white lg:min-h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="p-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            A
          </span>
          <span className="font-semibold tracking-tight text-ink-900">
            Admin Panel
          </span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
        {LINKS.map(({ href, label, icon: Icon }) => {
          // Dashboard matches exactly; section links match their subtree.
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
