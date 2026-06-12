"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setUserRole } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "ngo_admin" | "admin";
  created_at: string;
};

const ROLES = ["user", "ngo_admin", "admin"] as const;

const roleStyles: Record<AdminUserRow["role"], string> = {
  user: "text-ink-600 bg-ink-100 border-ink-200",
  ngo_admin: "text-primary-700 bg-primary-50 border-primary-200",
  admin: "text-violet-700 bg-violet-50 border-violet-200",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  const [rows, setRows] = useState(users);

  function patch(id: string, role: AdminUserRow["role"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)));
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => (
            <Row key={r.id} row={r} onPatch={patch} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-ink-500">
                No users.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  row,
  onPatch,
}: {
  row: AdminUserRow;
  onPatch: (id: string, role: AdminUserRow["role"]) => void;
}) {
  const [pending, startTransition] = useTransition();

  function changeRole(role: AdminUserRow["role"]) {
    const prev = row.role;
    onPatch(row.id, role);
    startTransition(async () => {
      const res = await setUserRole(row.id, role);
      if (res.error) onPatch(row.id, prev);
    });
  }

  return (
    <tr className="hover:bg-ink-50/50">
      <td className="px-4 py-3 font-medium text-ink-900">
        {row.name || "—"}
      </td>
      <td className="px-4 py-3 text-ink-600">{row.email || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-ink-500">
        {fmtDate(row.created_at)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <select
            value={row.role}
            onChange={(e) => changeRole(e.target.value as AdminUserRow["role"])}
            disabled={pending}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50",
              roleStyles[row.role]
            )}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {pending && (
            <Loader2 size={14} className="animate-spin text-ink-400" />
          )}
        </span>
      </td>
    </tr>
  );
}
