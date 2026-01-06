'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 sm:gap-2 rounded-lg border border-primary-500 bg-transparent px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2.5 lg:py-3.5 text-[10px] sm:text-xs font-medium text-primary-500 transition-opacity hover:opacity-80"
    >
      Sair
    </button>
  )
}
