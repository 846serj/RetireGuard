import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { createClient } from "@/lib/supabase/server";
import { getPublicBaseUrl } from "@/lib/siteUrl";
import { defaultOgImage } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicBaseUrl()),
  title: {
    default: "RetireShield — Your Free Retirement Safety Score",
    template: "%s | RetireShield",
  },
  description: "See how secure your retirement is in two minutes. Free Retirement Safety Score.",
  openGraph: {
    siteName: "RetireShield",
    type: "website",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "RetireShield Retirement Safety Score preview" }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader userEmail={userEmail} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
