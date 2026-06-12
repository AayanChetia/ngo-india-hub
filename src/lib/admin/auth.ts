import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Guards an admin area. Verifies the logged-in user has role = 'admin' in the
 * users table; otherwise redirects. On success returns the service-role admin
 * client (bypasses RLS) plus the authenticated user's id.
 *
 * Use the returned `admin` client for every read/write in admin pages so RLS
 * never blocks the query.
 */
export async function requireAdmin(): Promise<{
  admin: SupabaseClient<Database>;
  userId: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return { admin: createAdminClient(), userId: user.id };
}
