import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Panel — NGO India Hub",
  robots: { index: false, follow: false },
};

// Force dynamic — admin data must never be statically cached.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the entire /admin subtree. Redirects non-admins before any page runs.
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-ink-50/40 lg:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
