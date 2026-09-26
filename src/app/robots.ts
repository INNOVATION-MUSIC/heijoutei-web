import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION_SITE } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) return { rules: { userAgent: "*", disallow: "/" } };
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
