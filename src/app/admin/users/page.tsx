import { requireAdmin } from "@/lib/admin/auth";
import { UsersTable, type AdminUserRow } from "@/components/admin/UsersTable";
import type { UserRow } from "@/types/database";

export const dynamic = "force-dynamic";

async function getUsers(): Promise<AdminUserRow[]> {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("users")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });

  return ((data ?? []) as UserRow[]).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
  }));
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Users</h1>
      <p className="mt-1 text-ink-500">
        {users.length} registered. Change roles inline.
      </p>
      <div className="mt-8">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
