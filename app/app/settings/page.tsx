'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/chat/header'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications_enabled: boolean
  email_notifications: boolean
  push_notifications: boolean
  sound_enabled: boolean
  auto_save: boolean
  two_factor_enabled: boolean
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'tr',
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: false,
    sound_enabled: true,
    auto_save: true,
    two_factor_enabled: false,
  })

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setSettings({
          theme: data.theme || 'system',
          language: data.language || 'tr',
          notifications_enabled: data.notifications_enabled ?? true,
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? false,
          sound_enabled: data.sound_enabled ?? true,
          auto_save: data.auto_save ?? true,
          two_factor_enabled: data.two_factor_enabled ?? false,
        })
      }

      setLoading(false)
    }

    loadSettings()
  }, [])

  const handleToggle = (key: keyof UserSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleChange = (key: keyof UserSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase
        .from('user_settings')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })

    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>

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
                      Bildirimleri Etkinlestir
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Yeni mesajlar icin bildirimleri alin
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('notifications_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications_enabled
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications_enabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      E-posta Bildirimleri
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Onemli guncellemeler icin e-posta alin
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('email_notifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.email_notifications
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.email_notifications
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
                      Yeni mesaj geldiginde ses cal
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('sound_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sound_enabled
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.sound_enabled
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
                Gorunum
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
                    <option value="system">Otomatik</option>
                    <option value="light">Acik</option>
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
                    <option value="tr">Turkce</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Otomatik Kaydet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Degisiklikleri otomatik olarak kaydet
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('auto_save')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.auto_save
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.auto_save
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Guvenlik
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Iki Faktorlu Kimlik Dogrulama
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hesabinizi ekstra guvenlikle koruyun
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('two_factor_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.two_factor_enabled
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.two_factor_enabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <Button variant="outline" className="w-full">
                  Sifremi Degistir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
