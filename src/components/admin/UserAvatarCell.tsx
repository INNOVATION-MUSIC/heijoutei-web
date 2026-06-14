'use client'

import { useRouter } from 'next/navigation'
import AvatarUploader from './AvatarUploader'
import { updateUserAvatar } from '@/lib/actions/users'

// ユーザー一覧の行で、アイコンをその場でアップロード／変更する。
export default function UserAvatarCell({ id, avatarUrl }: { id: string; avatarUrl: string | null }) {
  const router = useRouter()

  async function handleChange(url: string) {
    const res = await updateUserAvatar(id, url)
    if (res?.error) {
      alert(res.error)
      return
    }
    router.refresh()
  }

  return <AvatarUploader value={avatarUrl} onChange={handleChange} size={40} />
}
