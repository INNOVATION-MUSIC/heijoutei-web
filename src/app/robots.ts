import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 管理画面・認証コールバック・APIはクロール不要
      disallow: ["/admin", "/auth", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
