import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getUserApplications,
  getUserSavedNgos,
  type UserApplication,
} from "@/lib/supabase/queries";
import { NgoCard } from "@/components/ngo/NgoCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your profile — NGO India Hub",
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route; this is a defensive fallback.
  if (!user) redirect("/login?redirect=/profile");

  // Each section loads independently — a failure in one (e.g. a transient
  // PostgREST schema-cache miss right after a migration) degrades to an empty
  // state instead of crashing the whole page.
  const [{ data: profile }, applications, savedNgos] = await Promise.all([
    supabase
      .from("users")
      .select("name, email, role, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    getUserApplications(supabase, user.id).catch(() => []),
    getUserSavedNgos(supabase, user.id).catch(() => []),
  ]);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  const name =
    profile?.name ??
    (user.user_metadata?.name as string | undefined) ??
    "there";

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Hi, {name} 👋
        </h1>
        <p className="mt-1 text-ink-500">This is your NGO India Hub profile.</p>

        <dl className="mt-8 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-ink-500">Name</dt>
            <dd className="font-medium text-ink-900">{profile?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-ink-500">Email</dt>
            <dd className="font-medium text-ink-900">
              {profile?.email ?? user.email}
            </dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-ink-500">Role</dt>
            <dd className="font-medium capitalize text-ink-900">
              {profile?.role ?? "user"}
            </dd>
          </div>
          {memberSince && (
            <div className="flex justify-between px-5 py-4 text-sm">
              <dt className="text-ink-500">Member since</dt>
              <dd className="font-medium text-ink-900">{memberSince}</dd>
            </div>
          )}
        </dl>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink-900">My Applications</h2>

          {applications.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              No applications yet —{" "}
              <Link
                href="/search"
                className="font-medium text-primary-700 hover:underline"
              >
                find an NGO to volunteer with
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink-900">Saved NGOs</h2>

          {savedNgos.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
              No saved NGOs yet — browse and click the bookmark icon to save.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {savedNgos.map((ngo) => (
                <NgoCard key={ngo.id} ngo={ngo} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<UserApplication["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function ApplicationCard({ app }: { app: UserApplication }) {
  const applied = new Date(app.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4">
      <div className="min-w-0">
        {app.ngo ? (
          <Link
            href={`/ngo/${app.ngo.slug}`}
            className="font-medium text-ink-900 hover:text-primary-700 hover:underline"
          >
            {app.ngo.name}
          </Link>
        ) : (
          <span className="font-medium text-ink-500">NGO unavailable</span>
        )}
        <p className="mt-0.5 text-xs text-ink-500">Applied {applied}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize",
          STATUS_STYLES[app.status]
        )}
      >
        {app.status}
      </span>
    </li>
  );
}
