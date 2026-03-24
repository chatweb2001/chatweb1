'use client'

import { signUpAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'

export default function SignUpPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await signUpAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">ChatWeb</h1>
            <p className="text-muted-foreground">Yeni hesap oluşturun</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ad
                </label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="Ahmet"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Soyad
                </label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Yılmaz"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-posta
              </label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                En az 8 karakter olmalıdır
              </p>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Zaten hesabınız var mı?
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
