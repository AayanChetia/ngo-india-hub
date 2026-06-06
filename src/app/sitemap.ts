import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getStates, stateSlug } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/site";

// Rebuild the sitemap at most hourly — NGO and listing data changes slowly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/state`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const [categories, states, ngoRes] = await Promise.all([
    getCategories(supabase),
    getStates(supabase),
    supabase
      .from("ngos")
      .select("slug, updated_at")
      .eq("listing_status", "Active"),
  ]);

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const stateEntries: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${SITE_URL}/state/${stateSlug(s.name)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const ngos = (ngoRes.data ?? []) as { slug: string; updated_at: string }[];
  const ngoEntries: MetadataRoute.Sitemap = ngos.map((n) => ({
    url: `${SITE_URL}/ngo/${n.slug}`,
    lastModified: n.updated_at ? new Date(n.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...stateEntries,
    ...ngoEntries,
  ];
}
