import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/siteUrl";
import { resourceArticles } from "@/content/resources";

const staticRoutes = [
  "",
  "/how-it-works",
  "/features",
  "/features/safety-score",
  "/features/monitoring",
  "/features/ai-coach",
  "/features/medicare-social-security",
  "/features/scam-shield",
  "/pricing",
  "/upgrade",
  "/about",
  "/resources",
  "/privacy",
  "/terms",
  "/refund-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicBaseUrl();
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route || "/", baseUrl).toString(),
      lastModified: now,
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : route === "/pricing" || route === "/features" ? 0.9 : 0.7,
    })),
    ...resourceArticles.map((article) => ({
      url: new URL(`/resources/${article.slug}`, baseUrl).toString(),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
