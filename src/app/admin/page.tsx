import Link from "next/link";
import {
  Building2,
  Users,
  HandHeart,
  Star,
  ArrowRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

async function getStats() {
  const { admin } = await requireAdmin();

  const [ngos, users, applications, reviews] = await Promise.all([
    admin.from("ngos").select("id", { count: "exact", head: true }),
    admin.from("users").select("id", { count: "exact", head: true }),
    admin
      .from("volunteer_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("is_approved", false),
  ]);

  return {
    ngos: ngos.count ?? 0,
    users: users.count ?? 0,
    applications: applications.count ?? 0,
    reviews: reviews.count ?? 0,
  };
}

const QUICK_LINKS = [
  { href: "/admin/ngos", label: "Manage NGOs", desc: "Edit, verify, set status" },
  {
    href: "/admin/applications",
    label: "Volunteer Applications",
    desc: "Review and respond",
  },
  { href: "/admin/users", label: "Users", desc: "Manage roles" },
  { href: "/admin/reviews", label: "Reviews", desc: "Moderate pending reviews" },
];

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total NGOs", value: stats.ngos, icon: Building2, tone: "primary" },
    { label: "Total Users", value: stats.users, icon: Users, tone: "accent" },
    {
      label: "Pending Applications",
      value: stats.applications,
      icon: HandHeart,
      tone: "amber",
    },
    {
      label: "Pending Reviews",
      value: stats.reviews,
      icon: Star,
      tone: "violet",
    },
  ] as const;

  const tones: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-accent-50 text-accent-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">
        Dashboard
      </h1>
      <p className="mt-1 text-ink-500">Overview of platform activity.</p>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                tones[c.tone]
              }`}
            >
              <c.icon size={20} />
            </span>
            <div className="mt-4 text-3xl font-bold text-ink-900">
              {c.value}
            </div>
            <div className="mt-0.5 text-sm text-ink-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-ink-400">
        Quick links
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
          >
            <div>
              <div className="font-semibold text-ink-900">{l.label}</div>
              <div className="mt-0.5 text-sm text-ink-500">{l.desc}</div>
            </div>
            <ArrowRight
              size={18}
              className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
