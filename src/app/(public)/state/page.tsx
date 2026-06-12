import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStatesWithCounts, stateSlug } from "@/lib/supabase/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NGOs by State in India | NGO India Hub",
  description:
    "Browse NGOs across all states in India. Find local NGOs in Maharashtra, Delhi, Karnataka, Tamil Nadu and more.",
  keywords: [
    "NGOs by state India", "state wise NGOs India",
    "NGOs Maharashtra", "NGOs Delhi", "NGOs Karnataka",
    "NGOs Tamil Nadu", "NGOs Gujarat", "local NGOs India",
  ],
};

export default async function StatesPage() {
  const supabase = createClient();
  const states = await getStatesWithCounts(supabase);

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-ink-100 bg-primary-50">
        <div className="container-page py-12">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">
            Browse NGOs by state
          </h1>
          <p className="mt-1 text-ink-500">
            {states.length} states covered — pick one to see the NGOs working
            there.
          </p>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {states.map((state) => (
            <Link
              key={state.id}
              href={`/state/${stateSlug(state.name)}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <MapPin size={18} />
                </span>
                <span className="font-semibold text-ink-900">{state.name}</span>
              </span>
              <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                {state.count} {state.count === 1 ? "NGO" : "NGOs"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
