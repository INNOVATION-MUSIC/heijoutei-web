import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer は Node.js ネイティブ機能を使うため Server バンドルから除外
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
