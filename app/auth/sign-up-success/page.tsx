'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hoş Geldiniz!
          </h1>
          <p className="text-muted-foreground mb-2">
            Hesabınız başarıyla oluşturuldu.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Lütfen e-postanızı kontrol edin ve hesabınızı onaylayın.
          </p>

          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">
                Sonraki Adımlar:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>E-postanızı açın</li>
                <li>Doğrulama bağlantısına tıklayın</li>
                <li>ChatWeb'e giriş yapın</li>
              </ol>
            </div>

            <Link href="/auth/login">
              <Button className="w-full">Giriş Sayfasına Git</Button>
            </Link>

            <p className="text-xs text-muted-foreground">
              E-posta gelmedi mi?{' '}
              <button className="underline hover:text-foreground">
                Yeniden Gönder
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
