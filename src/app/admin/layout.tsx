// 最小限のパススルーレイアウト。
// 認証チェックは (protected) ルートグループ側で行い、/admin/login を保護対象から外すことで
// 無限リダイレクト（ERR_TOO_MANY_REDIRECTS）を防ぐ。
export const metadata = {
  title: '平壌亭 CMS',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
