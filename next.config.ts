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
};

export default nextConfig;

initOpenNextCloudflareForDev();
