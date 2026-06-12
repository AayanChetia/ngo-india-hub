import { requireAdmin } from "@/lib/admin/auth";
import {
  ApplicationsTable,
  type AdminApplicationRow,
} from "@/components/admin/ApplicationsTable";
import type {
  VolunteerApplicationRow,
  NgoRow,
  UserRow,
} from "@/types/database";

export const dynamic = "force-dynamic";

async function getApplications(): Promise<AdminApplicationRow[]> {
  const { admin } = await requireAdmin();

  const { data: apps } = await admin
    .from("volunteer_applications")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (apps ?? []) as VolunteerApplicationRow[];
  if (rows.length === 0) return [];

  const ngoIds = Array.from(
    new Set(rows.map((r) => r.ngo_id).filter((v): v is string => !!v))
  );
  const userIds = Array.from(
    new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v))
  );

  const [{ data: ngos }, { data: users }] = await Promise.all([
    admin.from("ngos").select("id, name").in("id", ngoIds),
    admin.from("users").select("id, email").in("id", userIds),
  ]);

  const ngoName = new Map(
    ((ngos ?? []) as Pick<NgoRow, "id" | "name">[]).map((n) => [n.id, n.name])
  );
  const userEmail = new Map(
    ((users ?? []) as Pick<UserRow, "id" | "email">[]).map((u) => [
      u.id,
      u.email,
    ])
  );

  return rows.map((r) => ({
    id: r.id,
    ngoName: (r.ngo_id && ngoName.get(r.ngo_id)) || "—",
    userEmail: (r.user_id && userEmail.get(r.user_id)) || "—",
    message: r.message ?? "",
    status: r.status,
    created_at: r.created_at,
  }));
}

export default async function AdminApplicationsPage() {
  const applications = await getApplications();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">
        Volunteer Applications
      </h1>
      <p className="mt-1 text-ink-500">
        {applications.length} total. Update status inline.
      </p>
      <div className="mt-8">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
