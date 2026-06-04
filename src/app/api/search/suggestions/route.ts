import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSearchSuggestions } from "@/lib/supabase/queries";

const EMPTY = { ngos: [], categories: [], cities: [] };

/** GET /api/search/suggestions?q=... — grouped typeahead (NGOs, categories, cities). */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 1) {
    return NextResponse.json(EMPTY);
  }

  try {
    const supabase = createClient();
    const suggestions = await getSearchSuggestions(supabase, q, 8);
    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("Suggestions query failed:", err);
    return NextResponse.json(EMPTY, { status: 200 });
  }
}
