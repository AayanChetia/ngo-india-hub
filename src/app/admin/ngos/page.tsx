import { requireAdmin } from "@/lib/admin/auth";
import { NgoAdminTable, type AdminNgoRow } from "@/components/admin/NgoAdminTable";

export const dynamic = "force-dynamic";

type RawRow = {
  id: string;
  name: string;
  slug: string;
  is_verified: boolean;
  listing_status: AdminNgoRow["listing_status"];
  states: { name: string } | null;
  ngo_categories: Array<{
    is_primary: boolean;
    categories: { name: string } | null;
  }>;
};

async function getNgos(): Promise<AdminNgoRow[]> {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("ngos")
    .select(
      "id, name, slug, is_verified, listing_status, states ( name ), ngo_categories ( is_primary, categories ( name ) )"
    )
    .order("name");

  const rows = (data ?? []) as unknown as RawRow[];
  return rows.map((r) => {
    const primary =
      r.ngo_categories.find((c) => c.is_primary) ?? r.ngo_categories[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: primary?.categories?.name ?? "—",
      state: r.states?.name ?? "—",
      listing_status: r.listing_status,
      is_verified: r.is_verified,
    };
  });
}

export default async function AdminNgosPage() {
  const ngos = await getNgos();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">NGOs</h1>
      <p className="mt-1 text-ink-500">
        {ngos.length} organisations. Search, filter, verify, and set status.
      </p>
      <div className="mt-8">
        <NgoAdminTable ngos={ngos} />
      </div>
    </div>
  );
}
