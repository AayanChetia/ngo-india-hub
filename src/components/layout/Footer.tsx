import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Discover",
    links: [
      { label: "All Categories", href: "/#categories" },
      { label: "Browse by State", href: "/#states" },
      { label: "Featured NGOs", href: "/#featured" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "For NGOs",
    links: [
      { label: "List your NGO", href: "/list-your-ngo" },
      { label: "Claim a listing", href: "/register" },
      { label: "NGO Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Impact", href: "/impact" },
      { label: "Our Mission", href: "/#about" },
      { label: "How it works", href: "/#about" },
      { label: "Contact", href: "/#about" },
    ],
  },
];

/** Site footer with link columns, brand blurb, and social icons. */
export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              NG
            </span>
            <span className="text-base font-semibold text-ink-900">
              NGO India Hub
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">
            India&apos;s most comprehensive NGO discovery platform — find,
            explore, and connect with NGOs across every cause and every state.
          </p>
          <div className="mt-4 flex gap-3">
            <SocialLink label="Twitter" href="#">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </SocialLink>
            <SocialLink label="LinkedIn" href="#">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </SocialLink>
            <SocialLink label="Instagram" href="#">
              <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.4a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z" />
            </SocialLink>
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-ink-900">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-500 hover:text-primary-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-200">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} NGO India Hub. All rights reserved.</p>
          <p>Building India&apos;s most comprehensive NGO directory.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-500 shadow-sm transition-colors hover:bg-primary hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        {children}
      </svg>
    </a>
  );
}
