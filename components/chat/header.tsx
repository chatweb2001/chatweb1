'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { signOutAction } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAdmin(user.user_metadata?.is_admin === true)
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, full_name')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserName(profile.display_name || profile.full_name || 'Kullanıcı')
        }
      }
    }
    checkAdmin()
  }, [])

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link href="/app">
          <h1 className="text-2xl font-bold text-foreground">ChatWeb</h1>
        </Link>
        {userName && (
          <span className="text-sm text-muted-foreground">
            Merhaba, {userName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/app/profile">
          <Button variant="ghost" size="sm">
            Profil
          </Button>
        </Link>
        <Link href="/app/settings">
          <Button variant="ghost" size="sm">
            Ayarlar
          </Button>
        </Link>
        {isAdmin && (
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Admin
            </Button>
          </Link>
        )}
        <form action={signOutAction}>
          <Button variant="outline" size="sm">
            Çıkış
          </Button>
        </form>
      </div>
    </header>
  )
}
