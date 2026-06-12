"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { NgoInsert } from "@/types/database";

export type RegStatus = "Yes" | "No" | "Verify";

export type ListNgoInput = {
  name: string;
  categoryId: string;
  stateId: string;
  city: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  longDescription: string;
  registrationNumber: string;
  is80g: RegStatus;
  is12a: RegStatus;
  isFcra: RegStatus;
  volunteer: boolean;
  internship: boolean;
  donation: boolean;
  csr: boolean;
  /** Honeypot — must stay empty. Bots that auto-fill every field trip this. */
  website_url?: string;
};

export type ListNgoResult =
  | { ok: true }
  | { ok: false; errors?: Record<string, string>; message?: string };

const REG_VALUES: RegStatus[] = ["Yes", "No", "Verify"];
const DESCRIPTION_MAX = 300;

/** lowercase, spaces to hyphens, strip anything that isn't a-z 0-9 or hyphen. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Find a slug not already taken in the ngos table, appending -2, -3, … */
async function uniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string
): Promise<string> {
  const root = base || "ngo";
  let candidate = root;
  for (let n = 2; n < 100; n++) {
    const { data } = await admin
      .from("ngos")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${n}`;
  }
  // Extremely unlikely fallback — guarantee uniqueness with a random suffix.
  return `${root}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function submitNgoListing(
  input: ListNgoInput
): Promise<ListNgoResult> {
  // ── Honeypot ────────────────────────────────────────────────
  // A real user never sees or fills this field. If it has any value the
  // request is almost certainly a bot — pretend success and drop it silently
  // so the bot gets no signal to adapt.
  if (input.website_url && input.website_url.trim() !== "") {
    return { ok: true };
  }

  // ── Server-side validation ──────────────────────────────────
  const errors: Record<string, string> = {};
  const name = input.name?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const description = input.description?.trim() ?? "";

  if (!name) errors.name = "NGO name is required.";
  if (!input.categoryId) errors.categoryId = "Please select a category.";
  if (!input.stateId) errors.stateId = "Please select a state.";
  if (!city) errors.city = "City is required.";
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (!description) errors.description = "Short description is required.";
  else if (description.length > DESCRIPTION_MAX)
    errors.description = `Keep it under ${DESCRIPTION_MAX} characters.`;

  for (const [key, val] of [
    ["is80g", input.is80g],
    ["is12a", input.is12a],
    ["isFcra", input.isFcra],
  ] as const) {
    if (!REG_VALUES.includes(val)) errors[key] = "Invalid value.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const admin = createAdminClient();

  // Validate the foreign keys actually exist (defends against tampering).
  const [{ data: cat }, { data: state }] = await Promise.all([
    admin.from("categories").select("id").eq("id", input.categoryId).maybeSingle(),
    admin.from("states").select("id").eq("id", input.stateId).maybeSingle(),
  ]);
  if (!cat) return { ok: false, errors: { categoryId: "Unknown category." } };
  if (!state) return { ok: false, errors: { stateId: "Unknown state." } };

  const slug = await uniqueSlug(admin, slugify(name));
  // Human-readable, unique business key for public submissions.
  const ngoId = `LYN-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  const row: NgoInsert = {
    ngo_id: ngoId,
    slug,
    name,
    description,
    long_description: input.longDescription?.trim() || null,
    website: input.website?.trim() || null,
    email,
    phone: input.phone?.trim() || null,
    logo_url: null,
    social_links: {},
    founded_year: null,
    state_id: input.stateId,
    city,
    address: null,
    pincode: null,
    registration_number: input.registrationNumber?.trim() || null,
    is_80g: input.is80g,
    is_12a: input.is12a,
    is_fcra: input.isFcra,
    is_verified: false,
    listing_status: "Pending",
    volunteer_available: input.volunteer,
    internship_available: input.internship,
    donation_available: input.donation,
    accepts_csr: input.csr,
    team_size: null,
    funding_type: null,
    beneficiaries_count: null,
    impact_score: 0,
    last_verified_at: null,
    source_url: null,
  };

  const { data: inserted, error: insertError } = await admin
    .from("ngos")
    .insert(row)
    .select("id")
    .single();

  if (insertError || !inserted) {
    return {
      ok: false,
      message: "Could not save your submission. Please try again.",
    };
  }

  // Link the primary category. ngo_categories.ngo_id references ngos.id.
  const { error: linkError } = await admin.from("ngo_categories").insert({
    ngo_id: (inserted as { id: string }).id,
    category_id: input.categoryId,
    is_primary: true,
  });

  if (linkError) {
    // The listing exists; the category link can be fixed by an admin. Don't
    // fail the whole submission for the user.
    return { ok: true };
  }

  return { ok: true };
}
