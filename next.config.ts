import type { NextConfig } from "next";
// OpenNext: `next dev` 中も Cloudflare バインディング(getCloudflareContext)を使えるようにする
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage（media バケット）の公開画像を next/image で扱えるように許可
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucapzxfkyqzwzdpsumwo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // 旧サイト（page5.html 等）のURLが検索結果・Googleマップに残っているためトップへ転送
  async redirects() {
    return [
      {
        source: "/:file([^/]+\\.html)",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
