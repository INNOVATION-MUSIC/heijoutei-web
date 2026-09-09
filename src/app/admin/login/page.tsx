'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginCard from '@/components/admin/LoginCard'

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const initialError =
    searchParams.get('error') === 'auth'
      ? 'リンクが無効か、有効期限が切れています。再度お試しください。'
      : undefined
  const next = searchParams.get('next') || '/admin'
  return <LoginCard redirectTo={next} initialError={initialError} />
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  )
}
