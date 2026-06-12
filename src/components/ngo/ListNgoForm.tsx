"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import {
  submitNgoListing,
  type ListNgoInput,
  type RegStatus,
} from "@/app/list-your-ngo/actions";
import type { Category, State } from "@/types/database";
import { cn } from "@/lib/utils";

const DESCRIPTION_MAX = 300;
const REG_CHOICES: { value: RegStatus; label: string }[] = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Verify", label: "Not sure" },
];

type Errors = Record<string, string>;

const emptyForm: ListNgoInput = {
  name: "",
  categoryId: "",
  stateId: "",
  city: "",
  website: "",
  email: "",
  phone: "",
  description: "",
  longDescription: "",
  registrationNumber: "",
  is80g: "Verify",
  is12a: "Verify",
  isFcra: "Verify",
  volunteer: false,
  internship: false,
  donation: false,
  csr: false,
  website_url: "",
};

export function ListNgoForm({
  categories,
  states,
}: {
  categories: Category[];
  states: State[];
}) {
  const [form, setForm] = useState<ListNgoInput>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ListNgoInput>(key: K, value: ListNgoInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "NGO name is required.";
    if (!form.categoryId) e.categoryId = "Please select a category.";
    if (!form.stateId) e.stateId = "Please select a state.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    if (!form.description.trim())
      e.description = "Short description is required.";
    else if (form.description.length > DESCRIPTION_MAX)
      e.description = `Keep it under ${DESCRIPTION_MAX} characters.`;
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      // Scroll the first invalid field into view.
      const first = document.querySelector("[data-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    startTransition(async () => {
      const res = await submitNgoListing(form);
      if (res.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.errors) {
        setErrors(res.errors);
      } else {
        setFormError(res.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-green-600" />
        <h2 className="mt-4 text-xl font-bold text-ink-900">
          Thank you!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ink-600">
          We&apos;ll review your submission within 2-3 business days. Once
          approved, your NGO will appear on NGO India Hub.
        </p>
      </div>
    );
  }

  const descLen = form.description.length;
  const descOver = descLen > DESCRIPTION_MAX;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {/* Honeypot — hidden from users, off-screen and excluded from tab order.
          Bots that fill every field trip this and get silently rejected. */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website_url">Website URL (leave blank)</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website_url ?? ""}
          onChange={(e) => set("website_url", e.target.value)}
        />
      </div>

      {/* BASIC INFO */}
      <Section title="Basic info">
        <Field label="NGO name" required error={errors.name}>
          <TextInput
            value={form.name}
            onChange={(v) => set("name", v)}
            invalid={!!errors.name}
            placeholder="e.g. Sunrise Foundation"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Primary category" required error={errors.categoryId}>
            <SelectInput
              value={form.categoryId}
              onChange={(v) => set("categoryId", v)}
              invalid={!!errors.categoryId}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="State" required error={errors.stateId}>
            <SelectInput
              value={form.stateId}
              onChange={(v) => set("stateId", v)}
              invalid={!!errors.stateId}
            >
              <option value="">Select a state…</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="City" required error={errors.city}>
            <TextInput
              value={form.city}
              onChange={(v) => set("city", v)}
              invalid={!!errors.city}
              placeholder="e.g. Mumbai"
            />
          </Field>

          <Field label="Website" error={errors.website}>
            <TextInput
              value={form.website}
              onChange={(v) => set("website", v)}
              placeholder="https://"
              type="url"
            />
          </Field>

          <Field label="Email" required error={errors.email}>
            <TextInput
              value={form.email}
              onChange={(v) => set("email", v)}
              invalid={!!errors.email}
              placeholder="contact@ngo.org"
              type="email"
            />
          </Field>

          <Field label="Phone" error={errors.phone}>
            <TextInput
              value={form.phone}
              onChange={(v) => set("phone", v)}
              placeholder="+91…"
              type="tel"
            />
          </Field>
        </div>
      </Section>

      {/* ABOUT */}
      <Section title="About">
        <Field label="Short description" required error={errors.description}>
          <Textarea
            value={form.description}
            onChange={(v) => set("description", v)}
            invalid={!!errors.description}
            rows={3}
            maxLength={DESCRIPTION_MAX + 50}
            placeholder="A one-line summary of what your NGO does."
          />
          <div className="mt-1 flex justify-end text-xs">
            <span className={cn("text-ink-400", descOver && "text-red-600")}>
              {descLen}/{DESCRIPTION_MAX}
            </span>
          </div>
        </Field>

        <Field label="Long description" error={errors.longDescription}>
          <Textarea
            value={form.longDescription}
            onChange={(v) => set("longDescription", v)}
            rows={6}
            placeholder="What you do, your mission, and your impact."
          />
        </Field>
      </Section>

      {/* REGISTRATION */}
      <Section title="Registration">
        <Field label="Registration number" error={errors.registrationNumber}>
          <TextInput
            value={form.registrationNumber}
            onChange={(v) => set("registrationNumber", v)}
            placeholder="Optional"
          />
        </Field>

        <RadioRow
          label="Is 80G registered?"
          name="is80g"
          value={form.is80g}
          onChange={(v) => set("is80g", v)}
        />
        <RadioRow
          label="Is 12A registered?"
          name="is12a"
          value={form.is12a}
          onChange={(v) => set("is12a", v)}
        />
        <RadioRow
          label="Is FCRA registered?"
          name="isFcra"
          value={form.isFcra}
          onChange={(v) => set("isFcra", v)}
        />
      </Section>

      {/* OPPORTUNITIES */}
      <Section title="Opportunities">
        <div className="space-y-2.5">
          <Toggle
            label="Do you accept volunteers?"
            checked={form.volunteer}
            onChange={(v) => set("volunteer", v)}
          />
          <Toggle
            label="Do you offer internships?"
            checked={form.internship}
            onChange={(v) => set("internship", v)}
          />
          <Toggle
            label="Do you accept donations?"
            checked={form.donation}
            onChange={(v) => set("donation", v)}
          />
          <Toggle
            label="Open to CSR partnerships?"
            checked={form.csr}
            onChange={(v) => set("csr", v)}
          />
        </div>
      </Section>

      {formError && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 disabled:opacity-60 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit for review"
        )}
      </button>
    </form>
  );
}

// ── presentational helpers ─────────────────────────────────────

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
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" data-invalid={error ? "true" : undefined}>
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const baseField =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-100";

function fieldCls(invalid?: boolean) {
  return cn(
    baseField,
    invalid
      ? "border-red-300 focus:border-red-400"
      : "border-ink-200 focus:border-primary-400"
  );
}

function TextInput({
  value,
  onChange,
  invalid,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={fieldCls(invalid)}
    />
  );
}

function Textarea({
  value,
  onChange,
  invalid,
  rows = 3,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldCls(invalid), "resize-y")}
    />
  );
}

function SelectInput({
  value,
  onChange,
  invalid,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldCls(invalid)}
    >
      {children}
    </select>
  );
}

function RadioRow({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: RegStatus;
  onChange: (v: RegStatus) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {REG_CHOICES.map((c) => {
          const active = value === c.value;
          return (
            <label
              key={c.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary-300 bg-primary-50 text-primary-700"
                  : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
              )}
            >
              <input
                type="radio"
                name={name}
                checked={active}
                onChange={() => onChange(c.value)}
                className="sr-only"
              />
              {c.label}
            </label>
          );
        })}
      </div>
    </div>
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
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 hover:bg-ink-50">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-ink-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
