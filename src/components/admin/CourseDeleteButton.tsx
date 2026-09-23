'use client'

import DeleteButton from './DeleteButton'
import { deleteCourse } from '@/lib/actions/courses'

export default function CourseDeleteButton({ id, name }: { id: string; name: string }) {
  return <DeleteButton confirmTitle={`「${name}」を削除しますか？`} onDelete={() => deleteCourse(id)} />
}
