"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Pencil, Check, Loader2 } from "lucide-react";
import { setNgoVerified, setNgoStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminNgoRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  state: string;
  listing_status: "Active" | "Pending" | "Inactive";
  is_verified: boolean;
};

const STATUSES = ["Active", "Pending", "Inactive"] as const;

const statusStyles: Record<AdminNgoRow["listing_status"], string> = {
  Active: "text-accent-700 bg-accent-50 border-accent-200",
  Pending: "text-amber-700 bg-amber-50 border-amber-200",
  Inactive: "text-ink-500 bg-ink-100 border-ink-200",
};

export function NgoAdminTable({ ngos }: { ngos: AdminNgoRow[] }) {
  // Local mirror so inline edits reflect immediately without a full refetch.
  const [rows, setRows] = useState(ngos);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q || r.name.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || r.listing_status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  function patch(id: string, fields: Partial<AdminNgoRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...fields } : r))
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="h-11 w-full rounded-full border border-ink-200 bg-white pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-full border border-ink-200 bg-white px-4 text-sm text-ink-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 text-right font-medium">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((r) => (
              <Row key={r.id} row={r} onPatch={patch} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-ink-500"
                >
                  No NGOs match.
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
  row: AdminNgoRow;
  onPatch: (id: string, fields: Partial<AdminNgoRow>) => void;
}) {
  const [pending, startTransition] = useTransition();

  function toggleVerified() {
    const next = !row.is_verified;
    onPatch(row.id, { is_verified: next }); // optimistic
    startTransition(async () => {
      const res = await setNgoVerified(row.id, next);
      if (res.error) onPatch(row.id, { is_verified: !next }); // revert
    });
  }

  function changeStatus(status: AdminNgoRow["listing_status"]) {
    const prev = row.listing_status;
    onPatch(row.id, { listing_status: status });
    startTransition(async () => {
      const res = await setNgoStatus(row.id, status);
      if (res.error) onPatch(row.id, { listing_status: prev });
    });
  }

  return (
    <tr className="hover:bg-ink-50/50">
      <td className="px-4 py-3">
        <Link
          href={`/ngo/${row.slug}`}
          className="font-medium text-ink-900 hover:text-primary-700 hover:underline"
        >
          {row.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-ink-600">{row.category}</td>
      <td className="px-4 py-3 text-ink-600">{row.state}</td>
      <td className="px-4 py-3">
        <select
          value={row.listing_status}
          onChange={(e) =>
            changeStatus(e.target.value as AdminNgoRow["listing_status"])
          }
          disabled={pending}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50",
            statusStyles[row.listing_status]
          )}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={toggleVerified}
          disabled={pending}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:opacity-50",
            row.is_verified
              ? "border-accent-200 bg-accent-50 text-accent-700"
              : "border-ink-200 bg-white text-ink-500 hover:bg-ink-50"
          )}
        >
          {pending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Check size={13} className={row.is_verified ? "" : "opacity-40"} />
          )}
          {row.is_verified ? "Verified" : "Unverified"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/ngos/${row.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50"
        >
          <Pencil size={13} />
          Edit
        </Link>
      </td>
    </tr>
  );
}
