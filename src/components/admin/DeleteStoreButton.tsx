'use client'

import DeleteButton from './DeleteButton'
import { deleteStore } from '@/lib/actions/stores'

export default function DeleteStoreButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteButton
      confirmTitle={`「${name}」を削除しますか？`}
      confirmDescription="紐づくメニュー・コース・採用なども削除されます。この操作は元に戻せません。"
      onDelete={() => deleteStore(id)}
      className="text-xs text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
    />
  )
}
