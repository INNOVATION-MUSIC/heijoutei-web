import type { NextConfig } from "next";
// OpenNext: `next dev` 中も Cloudflare バインディング(getCloudflareContext)を使えるようにする
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // 縮小配信（/_next/image）を使わない。OpenNext は IMAGES バインディング無しだと縮小せず元画像を返すだけで、
    // 毎回 Worker と Supabase を通って無料枠を消費していた。画像は保存時点で WebP・配信サイズにしてある
    unoptimized: true,
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
