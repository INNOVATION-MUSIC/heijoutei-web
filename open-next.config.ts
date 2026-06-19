import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 最小構成。ISR をインスタンス跨ぎで永続化したくなったら incrementalCache に
// r2IncrementalCache を渡し、wrangler.jsonc に R2 バインディングを追加する。
export default defineCloudflareConfig();
