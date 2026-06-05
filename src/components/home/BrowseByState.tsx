import Link from "next/link";
import { MapPin } from "lucide-react";
import { stateSlug, type StateWithCount } from "@/lib/supabase/queries";

type BrowseByStateProps = {
  states: StateWithCount[];
};

/** Top states by NGO count, shown as clickable chips. */
export function BrowseByState({ states }: BrowseByStateProps) {
  if (states.length === 0) return null;

  return (
    <section id="states" className="scroll-mt-20 bg-ink-50 py-16 sm:py-20">
      <div className="container-page">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            Browse by state
          </h2>
          <p className="mt-2 text-ink-500">
            Find NGOs working in your part of India
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {states.map((state) => (
            <Link
              key={state.id}
              href={`/state/${stateSlug(state.name)}`}
              className="group flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
            >
              <MapPin
                size={15}
                className="text-primary-500 group-hover:text-primary-600"
              />
              <span className="font-medium text-ink-800">{state.name}</span>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                {state.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
