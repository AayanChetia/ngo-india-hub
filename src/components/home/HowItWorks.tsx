import { Search, BadgeCheck, HandHeart } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search by cause, city or name",
    desc: "Use the search bar or browse 15 cause categories and 22 states to find NGOs that match what you care about.",
  },
  {
    icon: BadgeCheck,
    title: "Explore verified profiles",
    desc: "Read each NGO's mission, programmes, impact score, and 80G/12A/FCRA registration status — all in one place.",
  },
  {
    icon: HandHeart,
    title: "Volunteer, donate or partner",
    desc: "Connect directly to volunteer, contribute, or set up a CSR partnership with the organisations you trust.",
  },
];

/** Three-step explainer of the core user journey. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            How it works
          </h2>
          <p className="mt-2 text-ink-500">
            From discovery to action in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 text-primary-700">
                <step.icon size={28} />
              </div>
              <span className="mt-4 inline-block rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                Step {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
