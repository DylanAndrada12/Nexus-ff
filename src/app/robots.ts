import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/torneos", "/resultados", "/ranking", "/equipos"],
        disallow: ["/admin", "/panel", "/api"],
      },
    ],
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
