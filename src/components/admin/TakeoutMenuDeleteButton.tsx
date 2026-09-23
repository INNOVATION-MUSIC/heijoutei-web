'use client'

import DeleteButton from './DeleteButton'
import { deleteTakeoutMenu } from '@/lib/actions/takeout-menus'

export default function TakeoutMenuDeleteButton({ id, name }: { id: string; name: string }) {
  return <DeleteButton confirmTitle={`「${name}」を削除しますか？`} onDelete={() => deleteTakeoutMenu(id)} />
}
