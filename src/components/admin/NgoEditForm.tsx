"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { updateNgo, type NgoEditableFields } from "@/app/admin/actions";
import type { NgoRow, StateRow } from "@/types/database";
import { cn } from "@/lib/utils";

const REG_OPTIONS = ["Yes", "No", "Verify"] as const;
const STATUS_OPTIONS = ["Active", "Pending", "Inactive"] as const;

export function NgoEditForm({
  ngo,
  states,
}: {
  ngo: NgoRow;
  states: StateRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NgoEditableFields>({
    name: ngo.name,
    description: ngo.description,
    long_description: ngo.long_description,
    city: ngo.city,
    state_id: ngo.state_id,
    website: ngo.website,
    email: ngo.email,
    phone: ngo.phone,
    is_80g: ngo.is_80g,
    is_12a: ngo.is_12a,
    is_fcra: ngo.is_fcra,
    is_verified: ngo.is_verified,
    listing_status: ngo.listing_status,
    volunteer_available: ngo.volunteer_available,
    internship_available: ngo.internship_available,
    donation_available: ngo.donation_available,
    accepts_csr: ngo.accepts_csr,
    impact_score: ngo.impact_score,
    team_size: ngo.team_size,
    funding_type: ngo.funding_type,
  });

  function set<K extends keyof NgoEditableFields>(
    key: K,
    value: NgoEditableFields[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateNgo(ngo.id, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Basics */}
      <Section title="Basics">
        <Field label="Name">
          <TextInput
            value={form.name ?? ""}
            onChange={(v) => set("name", v)}
          />
        </Field>
        <Field label="Short description">
          <Textarea
            value={form.description ?? ""}
            onChange={(v) => set("description", v)}
            rows={2}
          />
        </Field>
        <Field label="Long description">
          <Textarea
            value={form.long_description ?? ""}
            onChange={(v) => set("long_description", v)}
            rows={6}
          />
        </Field>
      </Section>

      {/* Location & contact */}
      <Section title="Location & contact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City">
            <TextInput
              value={form.city ?? ""}
              onChange={(v) => set("city", v)}
            />
          </Field>
          <Field label="State">
            <Select
              value={form.state_id ?? ""}
              onChange={(v) => set("state_id", v || null)}
            >
              <option value="">— None —</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Website">
            <TextInput
              value={form.website ?? ""}
              onChange={(v) => set("website", v)}
            />
          </Field>
          <Field label="Email">
            <TextInput
              value={form.email ?? ""}
              onChange={(v) => set("email", v)}
            />
          </Field>
          <Field label="Phone">
            <TextInput
              value={form.phone ?? ""}
              onChange={(v) => set("phone", v)}
            />
          </Field>
        </div>
      </Section>

      {/* Registration & compliance */}
      <Section title="Registration & compliance">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="80G">
            <Select
              value={form.is_80g ?? "Verify"}
              onChange={(v) => set("is_80g", v as NgoRow["is_80g"])}
            >
              {REG_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="12A">
            <Select
              value={form.is_12a ?? "Verify"}
              onChange={(v) => set("is_12a", v as NgoRow["is_12a"])}
            >
              {REG_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="FCRA">
            <Select
              value={form.is_fcra ?? "Verify"}
              onChange={(v) => set("is_fcra", v as NgoRow["is_fcra"])}
            >
              {REG_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Listing & involvement */}
      <Section title="Listing & involvement">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Listing status">
            <Select
              value={form.listing_status ?? "Pending"}
              onChange={(v) =>
                set("listing_status", v as NgoRow["listing_status"])
              }
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Impact score (0–10)">
            <TextInput
              type="number"
              value={form.impact_score == null ? "" : String(form.impact_score)}
              onChange={(v) =>
                set("impact_score", v === "" ? null : Number(v))
              }
            />
          </Field>
          <Field label="Team size">
            <TextInput
              value={form.team_size ?? ""}
              onChange={(v) => set("team_size", v)}
            />
          </Field>
          <Field label="Funding type">
            <TextInput
              value={form.funding_type ?? ""}
              onChange={(v) => set("funding_type", v)}
            />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Toggle
            label="Verified"
            checked={!!form.is_verified}
            onChange={(v) => set("is_verified", v)}
          />
          <Toggle
            label="Volunteer available"
            checked={!!form.volunteer_available}
            onChange={(v) => set("volunteer_available", v)}
          />
          <Toggle
            label="Internship available"
            checked={!!form.internship_available}
            onChange={(v) => set("internship_available", v)}
          />
          <Toggle
            label="Donation available"
            checked={!!form.donation_available}
            onChange={(v) => set("donation_available", v)}
          />
          <Toggle
            label="Accepts CSR"
            checked={!!form.accepts_csr}
            onChange={(v) => set("accepts_csr", v)}
          />
        </div>
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t border-ink-100 bg-ink-50/40 px-1 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white shadow-sm hover:bg-primary-600 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Save changes
        </button>
        {saved && !pending && (
          <span className="text-sm font-medium text-accent-700">Saved.</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}

// ── small presentational helpers ───────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100";

function TextInput({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClasses}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldClasses, "resize-y")}
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClasses}
    >
      {children}
    </select>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-800 hover:bg-ink-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-ink-300 text-primary focus:ring-primary-400"
      />
      {label}
    </label>
  );
}
