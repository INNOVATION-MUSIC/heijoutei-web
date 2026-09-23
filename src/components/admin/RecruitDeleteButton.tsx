'use client'

import DeleteButton from './DeleteButton'
import { deleteRecruit } from '@/lib/actions/recruitments'

export default function RecruitDeleteButton({ id, title }: { id: string; title: string }) {
  return <DeleteButton confirmTitle={`「${title}」を削除しますか？`} onDelete={() => deleteRecruit(id)} />
}
