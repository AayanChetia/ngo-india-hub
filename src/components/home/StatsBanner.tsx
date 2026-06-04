import type { HomeStats } from "@/lib/supabase/queries";

type StatsBannerProps = {
  stats: HomeStats;
};

/** Full-width banner highlighting the platform's coverage numbers. */
export function StatsBanner({ stats }: StatsBannerProps) {
  const items = [
    { value: stats.ngoCount, label: "Verified NGOs" },
    { value: stats.stateCount, label: "States covered" },
    { value: stats.categoryCount, label: "Cause categories" },
  ];

  return (
    <section className="bg-primary">
      <div className="container-page grid grid-cols-3 gap-6 py-12 text-center text-white">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              {item.value}+
            </div>
            <div className="mt-1 text-sm text-primary-100 sm:text-base">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
