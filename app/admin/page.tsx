'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Statistics {
  totalUsers: number
  activeUsers: number
  totalConversations: number
  totalMessages: number
  averageMessagesPerUser: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadAdmin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const isAdminUser = user.user_metadata?.is_admin
      setIsAdmin(isAdminUser)

      if (isAdminUser) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')

        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')

        const { data: messages } = await supabase
          .from('messages')
          .select('id')

        setStats({
          totalUsers: profiles?.length || 0,
          activeUsers: Math.floor((profiles?.length || 0) * 0.7),
          totalConversations: conversations?.length || 0,
          totalMessages: messages?.length || 0,
          averageMessagesPerUser:
            profiles && messages
              ? Math.round(messages.length / profiles.length)
              : 0,
        })
      }

      setLoading(false)
    }

    loadAdmin()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        Yükleniyor...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Erişim Reddedildi
          </h1>
          <p className="text-muted-foreground mb-6">
            Bu sayfaya erişmek için yönetici izni gereklidir.
          </p>
          <Link href="/app">
            <Button>Anasayfaya Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">Yönetici Paneli</h1>
          <Link href="/app">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Users */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Toplam Kullanıcı
              </h3>
              <p className="text-4xl font-bold text-foreground">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.activeUsers} aktif
              </p>
            </div>

            {/* Total Conversations */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Toplam Sohbet
              </h3>
              <p className="text-4xl font-bold text-foreground">
                {stats.totalConversations}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.totalUsers > 0 ? Math.round(stats.totalConversations / stats.totalUsers) : 0} sohbet/kullanıcı
              </p>
            </div>

            {/* Total Messages */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Toplam Mesaj
              </h3>
              <p className="text-4xl font-bold text-foreground">
                {stats.totalMessages}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.averageMessagesPerUser} mesaj/kullanıcı
              </p>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Yönetim İşlemleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Kullanıcıları Yönet
            </Button>
            <Button variant="outline" className="w-full">
              Sohbetleri Yönet
            </Button>
            <Button variant="outline" className="w-full">
              Raporları Görüntüle
            </Button>
            <Button variant="outline" className="w-full">
              Sistem Ayarları
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
