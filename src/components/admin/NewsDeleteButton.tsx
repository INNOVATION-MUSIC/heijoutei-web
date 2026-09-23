'use client'

import DeleteButton from './DeleteButton'
import { deleteNews } from '@/lib/actions/news'

export default function NewsDeleteButton({ id, title }: { id: string; title: string }) {
  return <DeleteButton confirmTitle={`「${title}」を削除しますか？`} onDelete={() => deleteNews(id)} />
}
