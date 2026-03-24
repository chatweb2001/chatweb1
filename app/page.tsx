'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lock, Zap, Users, MessageCircle, Image as ImageIcon, Mic, Heart, UserCircle, Check } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.push('/app')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            ChatWeb'e Hoş Geldiniz
          </h1>
          <p className="text-xl text-muted-foreground">
            Güvenli, hızlı ve kullanıcı dostu mesajlaşma uygulaması
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Güvenli</h3>
            <p className="text-sm text-muted-foreground">
              Uçtan uca şifrelemeli güvenli mesajlaşma
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Hızlı</h3>
            <p className="text-sm text-muted-foreground">
              Anlık mesajlaşma ve bildirimler
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Topluluk</h3>
            <p className="text-sm text-muted-foreground">
              Grup sohbetleri ve iş birliği
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row sm:justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="w-full sm:w-auto">
              Kayıt Ol
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Giriş Yap
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Özellikler
          </h3>
          <ul className="text-sm text-muted-foreground space-y-3">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Gerçek zamanlı mesajlaşma
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Grup sohbetleri
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Dosya ve medya paylaşımı
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Sesli mesajlar
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Emoji reaksiyonları
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Kullanıcı profilleri ve ayarları
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
