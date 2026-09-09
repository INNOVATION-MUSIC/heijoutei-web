-- 022: 店舗ごとのテイクアウト注文／お問い合わせ通知先メール
-- stores 本体は anon(SELECT) が全列参照可のため、通知先メールは別テーブルへ分離し
-- anon/authenticated からのアクセスを遮断する（service_role のみ）。
-- /api/takeout・/api/contact が service_role で参照。未設定店舗は環境変数にフォールバック。

CREATE TABLE IF NOT EXISTS public.store_mail_settings (
  store_id              UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  takeout_notify_emails TEXT[] NOT NULL DEFAULT '{}',
  contact_notify_emails TEXT[] NOT NULL DEFAULT '{}',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER store_mail_settings_updated_at BEFORE UPDATE ON public.store_mail_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.store_mail_settings ENABLE ROW LEVEL SECURITY;
-- RLS ポリシーは作らない＝anon/authenticated は行を取得できない（service_role は RLS バイパス）

REVOKE ALL ON public.store_mail_settings FROM anon, authenticated;
GRANT ALL ON public.store_mail_settings TO service_role;
