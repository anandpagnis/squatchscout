import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/base-camp", "/den", "/admin", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
