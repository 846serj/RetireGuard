import type { Metadata } from "next";
import { getPublicBaseUrl } from "@/lib/siteUrl";

export const siteName = "RetireShield";
export const defaultOgImage = "/og/retireshield-og.svg";

export function pageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const baseUrl = getPublicBaseUrl();
  const url = new URL(path, baseUrl).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "RetireShield Retirement Safety Score preview" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage],
    },
  };
}
