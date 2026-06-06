import { createClient } from "@/lib/supabase/server";
import { HeaderClient, type HeaderUser } from "./HeaderClient";

/**
 * Sticky site header. Server component: resolves the signed-in user (and their
 * profile name) via supabase.auth.getUser(), then hands off to HeaderClient for
 * the interactive nav, search, and auth controls.
 */
export async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let headerUser: HeaderUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    headerUser = {
      name:
        profile?.name ??
        (user.user_metadata?.name as string | undefined) ??
        user.email ??
        "Account",
    };
  }

  return <HeaderClient user={headerUser} />;
}
