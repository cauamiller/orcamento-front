'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuthRedirect(redirectTo = '/login') {
  const router = useRouter()

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('token')

    if (!token) {
      router.push(redirectTo)
    }
  }, [router, redirectTo])
}
