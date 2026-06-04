import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NGO } from "@/types/database";
import { NgoCard } from "@/components/ngo/NgoCard";
import { Button } from "@/components/ui/Button";

type FeaturedNgosProps = {
  ngos: NGO[];
};

/** Showcases the highest-impact verified NGOs on the homepage. */
export function FeaturedNgos({ ngos }: FeaturedNgosProps) {
  if (ngos.length === 0) return null;

  return (
    <section
      id="featured"
      className="scroll-mt-20 bg-ink-50 py-16 sm:py-20"
    >
      <div className="container-page">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">
              Featured NGOs
            </h2>
            <p className="mt-2 text-ink-500">
              High-impact organisations making a difference across India
            </p>
          </div>
          <Link
            href="/search"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 sm:flex"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ngos.map((ngo) => (
            <NgoCard key={ngo.id} ngo={ngo} border="top" />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/search">
            <Button size="lg" variant="primary">
              View all NGOs <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
