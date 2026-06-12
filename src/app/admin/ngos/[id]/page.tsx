import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { NgoEditForm } from "@/components/admin/NgoEditForm";
import type { NgoRow, StateRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminNgoEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { admin } = await requireAdmin();

  const [{ data: ngo }, { data: states }] = await Promise.all([
    admin.from("ngos").select("*").eq("id", params.id).maybeSingle(),
    admin.from("states").select("*").order("name"),
  ]);

  if (!ngo) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/ngos"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={15} />
        Back to NGOs
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
        Edit NGO
      </h1>
      <p className="mt-1 text-ink-500">{(ngo as NgoRow).name}</p>

      <div className="mt-8">
        <NgoEditForm
          ngo={ngo as NgoRow}
          states={(states ?? []) as StateRow[]}
        />
      </div>
    </div>
  );
}
