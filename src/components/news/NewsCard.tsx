import { Newspaper, ExternalLink } from "lucide-react";

export type NewsCardProps = {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  image: string | null;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** A single news article card with optional thumbnail. */
export function NewsCard({
  title,
  description,
  url,
  source,
  publishedAt,
  image,
}: NewsCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
    >
      {/* Thumbnail */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
          <Newspaper className="text-primary-500" size={36} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span className="font-medium text-primary-700">{source}</span>
          {publishedAt && (
            <>
              <span aria-hidden>·</span>
              <span>{formatDate(publishedAt)}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-semibold text-ink-900 group-hover:text-primary-700">
          {title}
        </h3>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">
            {description}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-ink-400 group-hover:text-primary-600">
          Read article <ExternalLink size={12} />
        </span>
      </div>
    </a>
  );
}
