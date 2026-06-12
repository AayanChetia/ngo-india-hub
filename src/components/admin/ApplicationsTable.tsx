"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setApplicationStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminApplicationRow = {
  id: string;
  ngoName: string;
  userEmail: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

const STATUSES = ["pending", "accepted", "rejected"] as const;

const statusStyles: Record<AdminApplicationRow["status"], string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  accepted: "text-accent-700 bg-accent-50 border-accent-200",
  rejected: "text-red-700 bg-red-50 border-red-200",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApplicationsTable({
  applications,
}: {
  applications: AdminApplicationRow[];
}) {
  const [rows, setRows] = useState(applications);
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  function patch(id: string, status: AdminApplicationRow["status"]) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return (
    <div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="h-11 rounded-full border border-ink-200 bg-white px-4 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">NGO</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((r) => (
              <Row key={r.id} row={r} onPatch={patch} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-500">
                  No applications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  row,
  onPatch,
}: {
  row: AdminApplicationRow;
  onPatch: (id: string, status: AdminApplicationRow["status"]) => void;
}) {
  const [pending, startTransition] = useTransition();

  function changeStatus(status: AdminApplicationRow["status"]) {
    const prev = row.status;
    onPatch(row.id, status);
    startTransition(async () => {
      const res = await setApplicationStatus(row.id, status);
      if (res.error) onPatch(row.id, prev);
    });
  }

  return (
    <tr className="hover:bg-ink-50/50">
      <td className="px-4 py-3 font-medium text-ink-900">{row.ngoName}</td>
      <td className="px-4 py-3 text-ink-600">{row.userEmail}</td>
      <td className="max-w-xs truncate px-4 py-3 text-ink-600" title={row.message}>
        {row.message || "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-ink-500">
        {fmtDate(row.created_at)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <select
            value={row.status}
            onChange={(e) =>
              changeStatus(e.target.value as AdminApplicationRow["status"])
            }
            disabled={pending}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50",
              statusStyles[row.status]
            )}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
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
