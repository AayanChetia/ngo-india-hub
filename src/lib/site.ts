/** Canonical site URL and name, used by metadata, sitemap, robots, and JSON-LD. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ngoindiaHub.in"
).replace(/\/$/, "");

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "NGO India Hub";
