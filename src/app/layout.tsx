import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareProvider } from "@/components/compare/CompareProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "NGO India Hub — Discover India's Most Impactful NGOs",
    template: "%s | NGO India Hub",
  },
  description:
    "Find and connect with verified NGOs across India. Search by cause, city, or state. Volunteer, donate, or partner for CSR — 234+ NGOs listed.",
  keywords: [
    "NGO in India", "NGOs India", "volunteer India", "donate India",
    "non profit India", "charity India", "CSR India", "social work India",
    "NGO volunteer opportunities", "internship NGO India",
    "best NGOs India", "verified NGOs", "NGO directory India",
    "how to volunteer India", "NGO near me India",
  ],
  authors: [{ name: "NGO India Hub" }],
  creator: "NGO India Hub",
  publisher: "NGO India Hub",
  metadataBase: new URL("https://ngoindiahub.in"),
  alternates: { canonical: "https://ngoindiahub.in" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ngoindiahub.in",
    siteName: "NGO India Hub",
    title: "NGO India Hub — Discover India's Most Impactful NGOs",
    description:
      "Find and connect with verified NGOs across India. Search by cause, city, or state. Volunteer, donate, or partner for CSR.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NGO India Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGO India Hub — Discover India's Most Impactful NGOs",
    description:
      "Find and connect with verified NGOs across India. Volunteer, donate, or partner for CSR.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "aGQeePfewlGIuJx5gbPLKV2pNDAWGSD18JGzpQQk_XY",
  },
  category: "nonprofit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-white antialiased`}
      >
        <CompareProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </CompareProvider>
      </body>
    </html>
  );
}
