import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer は Node.js ネイティブ機能を使うため Server バンドルから除外
  serverExternalPackages: ["nodemailer"],
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
