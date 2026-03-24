'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/chat/header'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    messageSound: true,
    theme: 'auto',
    language: 'tr',
    twoFactor: false,
  })

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Ayarlar</h1>

          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Bildirimler
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Bildirimleri Etkinleştir
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Yeni mesajlar için bildirimleri alın
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('notifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Mesaj Sesi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Yeni mesaj geldiğinde ses çal
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('messageSound')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.messageSound
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.messageSound
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Görünüm
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tema
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      handleChange('theme', e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="auto">Otomatik</option>
                    <option value="light">Açık</option>
                    <option value="dark">Koyu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dil
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      handleChange('language', e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Güvenlik
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      İki Faktörlü Kimlik Doğrulama
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hesabınızı ekstra güvenlikle koruyun
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('twoFactor')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.twoFactor
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.twoFactor
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <Button variant="outline" className="w-full">
                  Şifremi Değiştir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
