'use client'

import DeleteButton from './DeleteButton'
import { deleteStoreMenu } from '@/lib/actions/menus'

export default function MenuDeleteButton({ id, label }: { id: string; label: string }) {
  return (
    <DeleteButton
      confirmTitle={`「${label}」を削除しますか？`}
      confirmDescription="紐づく品目も削除されます。この操作は元に戻せません。"
      onDelete={() => deleteStoreMenu(id)}
    />
  )
}
