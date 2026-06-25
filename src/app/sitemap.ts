import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { CATEGORIES, CITIES } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "",
    "/services",
    "/for-contractors",
    "/about",
    "/pricing",
    "/contact",
    "/trust-safety",
    "/blog",
    "/legal/terms",
    "/legal/privacy",
    "/signup",
    "/login",
  ];

  const categoryPaths = CATEGORIES.map((c) => `/services/${c.slug}`);
  const localPaths = CATEGORIES.flatMap((c) =>
    CITIES.map((city) => `/local/${c.slug}-in-${city.slug}`),
  );

  return [...staticPaths, ...categoryPaths, ...localPaths].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.startsWith("/local/") ? 0.5 : 0.7,
  }));
}
