import type { MetadataRoute } from "next";
import { WEBSITES, SITE_URL, SITE_LAST_MODIFIED } from "@/lib/websites";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1,
    },
    ...WEBSITES.map((site) => ({
      url: `${SITE_URL}${site.path}`,
      lastModified: site.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/privacy`,
      lastModified: "2026-07-26",
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
