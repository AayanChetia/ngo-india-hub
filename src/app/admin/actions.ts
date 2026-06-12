"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { NgoRow, UserRow, VolunteerApplicationRow } from "@/types/database";

/**
 * Server actions for the admin panel. Every action re-checks admin access via
 * requireAdmin() and uses the service-role client so RLS never blocks writes.
 */

export async function setNgoVerified(id: string, value: boolean) {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("ngos")
    .update({ is_verified: value })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ngos");
  return { error: null };
}

export async function setNgoStatus(
  id: string,
  status: NgoRow["listing_status"]
) {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("ngos")
    .update({ listing_status: status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ngos");
  return { error: null };
}

// Whitelisted, type-safe subset of NGO columns the edit form may write.
export type NgoEditableFields = Partial<
  Pick<
    NgoRow,
    | "name"
    | "description"
    | "long_description"
    | "city"
    | "website"
    | "email"
    | "phone"
    | "is_80g"
    | "is_12a"
    | "is_fcra"
    | "is_verified"
    | "listing_status"
    | "volunteer_available"
    | "internship_available"
    | "donation_available"
    | "accepts_csr"
    | "impact_score"
    | "team_size"
    | "funding_type"
    | "state_id"
  >
>;

export async function updateNgo(id: string, fields: NgoEditableFields) {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("ngos").update(fields).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ngos");
  revalidatePath(`/admin/ngos/${id}`);
  return { error: null };
}

export async function setApplicationStatus(
  id: string,
  status: VolunteerApplicationRow["status"]
) {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("volunteer_applications")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/applications");
  return { error: null };
}

export async function setUserRole(id: string, role: UserRow["role"]) {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("users").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { error: null };
}
