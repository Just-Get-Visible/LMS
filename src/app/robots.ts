import type { MetadataRoute } from "next";

import { getAppBaseUrl } from "@/lib/email/client";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/dashboard",
          "/instructor",
          "/admin",
          "/api/",
          "/login",
          "/signup",
          "/unauthorized",
          "/unsubscribe",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
