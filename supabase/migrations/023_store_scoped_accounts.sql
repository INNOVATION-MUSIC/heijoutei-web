-- 023: 店舗スコープ管理アカウント
-- profiles.store_ids に店舗を指定した editor は、その店舗のデータのみ管理できる。
-- NULL/空 = 全店（本部）。role='admin' も全店。認可はアプリ層（service_role + auth-guard）で実施。

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_ids uuid[];

COMMENT ON COLUMN public.profiles.store_ids IS
  'NULL/空=全店(本部)アクセス。stores.id の配列を指定すると role=editor はその店舗のみ管理可。role=admin は無視され常に全店。';

-- 問い合わせを店舗でスコープするための店舗参照（現状は subject の "（店舗名）" しか手がかりが無い）
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contact_messages_store_id ON public.contact_messages(store_id);

-- 既存レコードを subject 末尾の "（店舗名）" から店舗へ紐付け（一致しない行は NULL=本部のみ閲覧）
UPDATE public.contact_messages c
  SET store_id = s.id
  FROM public.stores s
  WHERE c.store_id IS NULL
    AND c.subject LIKE '%（' || s.name || '）';

-- 権限はテーブルレベル GRANT（006_grants.sql）で新列も自動カバー。RLS 追加不要。
