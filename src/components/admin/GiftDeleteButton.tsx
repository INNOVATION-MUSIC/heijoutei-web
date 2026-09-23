'use client'

import DeleteButton from './DeleteButton'
import { deleteGift } from '@/lib/actions/gifts'

export default function GiftDeleteButton({ id, name }: { id: string; name: string }) {
  return <DeleteButton confirmTitle={`「${name}」を削除しますか？`} onDelete={() => deleteGift(id)} />
}
