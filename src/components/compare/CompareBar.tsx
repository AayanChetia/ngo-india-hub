"use client";

import { useRouter } from "next/navigation";
import { X, Scale } from "lucide-react";
import { useCompare } from "./CompareProvider";

/** Floating shortlist bar — appears when 1+ NGOs are selected for comparison. */
export function CompareBar() {
  const { items, remove, clear, toast } = useCompare();
  const router = useRouter();

  if (items.length === 0) {
    // Still render the toast region so "Maximum 3 NGOs" can show even if the
    // bar is somehow empty (it won't be, but keeps the toast independent).
    return toast ? <Toast message={toast} /> : null;
  }

  function compare() {
    const qs = items.map((i) => i.slug).join(",");
    router.push(`/compare?ngos=${encodeURIComponent(qs)}`);
  }

  return (
    <>
      {toast && <Toast message={toast} />}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="container-page flex flex-wrap items-center gap-3 py-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <Scale size={16} className="text-primary" />
            Compare
            <span className="text-ink-400">({items.length}/3)</span>
          </span>

          <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
            {items.map((item) => (
              <li
                key={item.slug}
                className="flex max-w-[14rem] items-center gap-1.5 rounded-full bg-ink-100 py-1 pl-3 pr-1.5 text-sm text-ink-700"
              >
                <span className="truncate">{item.name}</span>
                <button
                  onClick={() => remove(item.slug)}
                  aria-label={`Remove ${item.name}`}
                  className="rounded-full p-0.5 text-ink-500 hover:bg-ink-200 hover:text-ink-900"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={clear}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            >
              Clear all
            </button>
            <button
              onClick={compare}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}
