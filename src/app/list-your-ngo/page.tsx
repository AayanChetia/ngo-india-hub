import type { Metadata } from "next";
import { Gift, Users, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getStates } from "@/lib/supabase/queries";
import { ListNgoForm } from "@/components/ngo/ListNgoForm";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "List your NGO in India | NGO India Hub",
  description:
    "Add your NGO to NGO India Hub for free. Reach thousands of volunteers, donors, and CSR partners across India.",
  keywords: [
    "list NGO India", "add NGO India", "register NGO directory",
    "free NGO listing India", "submit NGO", "NGO CSR partnerships India",
  ],
  alternates: { canonical: `${SITE_URL}/list-your-ngo` },
  openGraph: {
    title: "List your NGO in India | NGO India Hub",
    description:
      "Add your NGO to NGO India Hub for free. Reach volunteers, donors, and CSR partners.",
    url: `${SITE_URL}/list-your-ngo`,
    siteName: SITE_NAME,
    type: "website",
  },
};

const BENEFITS = [
  { icon: Gift, label: "Free listing" },
  { icon: Users, label: "Reach volunteers" },
  { icon: Building2, label: "CSR partnerships" },
];

export default async function ListYourNgoPage() {
  const supabase = createClient();
  const [categories, states] = await Promise.all([
    getCategories(supabase),
    getStates(supabase),
  ]);

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-ink-100 bg-primary-50">
        <div className="container-page py-14 text-center sm:py-16">
          <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            List your NGO on NGO India Hub
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            Reach thousands of volunteers, donors, and CSR partners across
            India. Free to list.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 shadow-sm"
              >
                <Icon size={16} className="text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-page py-10 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <ListNgoForm categories={categories} states={states} />
        </div>
      </div>
    </div>
  );
}
