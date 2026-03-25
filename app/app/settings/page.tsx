'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/chat/header'
import {
  Bell, Monitor, Shield, Lock, CheckCircle, AlertCircle,
  Sun, Moon, Laptop, Volume2, Mail, Smartphone, Save, RefreshCw
} from 'lucide-react'

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

type ToastState = { type: 'success' | 'error'; message: string } | null

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeSection, setActiveSection] = useState('bildirimler')

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
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUser(user)

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
    load()
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      showToast('success', 'Ayarlar basariyla kaydedildi')
    } catch {
      showToast('error', 'Kaydedilirken bir hata olustu')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast('error', 'Sifreler eslesmiyor')
      return
    }
    if (newPassword.length < 6) {
      showToast('error', 'Sifre en az 6 karakter olmalidir')
      return
    }
    setChangingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      showToast('success', 'Sifre basariyla degistirildi')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showToast('error', 'Sifre degistirilirken hata olustu')
    } finally {
      setChangingPassword(false)
    }
  }

  const navItems = [
    { id: 'bildirimler', label: 'Bildirimler', icon: Bell },
    { id: 'gorunum', label: 'Gorunum', icon: Monitor },
    { id: 'guvenlik', label: 'Guvenlik', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Yukleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800'
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Ayarlar</h2>
            <p className="text-xs text-muted-foreground mt-1">Hesap tercihlerinizi yonetin</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeSection === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
              {saving ? (
                <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Kaydediliyor...</>
              ) : (
                <><Save className="h-3.5 w-3.5 mr-2" /> Kaydet</>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between md:hidden">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
                <p className="text-sm text-muted-foreground">Hesap tercihlerinizi yonetin</p>
              </div>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/40">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Bildirimler
                </h2>
              </div>
              <div className="px-6 divide-y divide-border">
                <SettingRow
                  icon={Bell}
                  title="Bildirimleri Etkinlestir"
                  description="Yeni mesajlar ve guncellemeler icin bildirim alin"
                >
                  <Toggle
                    checked={settings.notifications_enabled}
                    onChange={() => toggle('notifications_enabled')}
                  />
                </SettingRow>
                <SettingRow
                  icon={Mail}
                  title="E-posta Bildirimleri"
                  description="Onemli guncellemeler icin e-posta alin"
                >
                  <Toggle
                    checked={settings.email_notifications}
                    onChange={() => toggle('email_notifications')}
                    disabled={!settings.notifications_enabled}
                  />
                </SettingRow>
                <SettingRow
                  icon={Smartphone}
                  title="Push Bildirimleri"
                  description="Tarayici push bildirimleri alin"
                >
                  <Toggle
                    checked={settings.push_notifications}
                    onChange={() => toggle('push_notifications')}
                    disabled={!settings.notifications_enabled}
                  />
                </SettingRow>
                <SettingRow
                  icon={Volume2}
                  title="Mesaj Sesi"
                  description="Yeni mesaj geldiginde ses efekti cal"
                >
                  <Toggle
                    checked={settings.sound_enabled}
                    onChange={() => toggle('sound_enabled')}
                  />
                </SettingRow>
              </div>
            </div>

            {/* Display */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/40">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Gorunum
                </h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tema</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', label: 'Acik', Icon: Sun },
                      { value: 'dark', label: 'Koyu', Icon: Moon },
                      { value: 'system', label: 'Otomatik', Icon: Laptop },
                    ].map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, theme: value as UserSettings['theme'] }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                          settings.theme === value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Dil</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(s => ({ ...s, language: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="tr">Turkce</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="divide-y divide-border">
                  <SettingRow
                    icon={Save}
                    title="Otomatik Kaydet"
                    description="Degisiklikleri otomatik olarak kaydet"
                  >
                    <Toggle
                      checked={settings.auto_save}
                      onChange={() => toggle('auto_save')}
                    />
                  </SettingRow>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/40">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Guvenlik
                </h2>
              </div>
              <div className="px-6 divide-y divide-border">
                <SettingRow
                  icon={Shield}
                  title="Iki Faktorlu Dogrulama"
                  description="Hesabinizi ekstra guvenlik katmaniyla koruyun"
                >
                  <Toggle
                    checked={settings.two_factor_enabled}
                    onChange={() => toggle('two_factor_enabled')}
                  />
                </SettingRow>
              </div>

              {/* Password Change */}
              <div className="px-6 py-5 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sifre Degistir</p>
                    <p className="text-xs text-muted-foreground">Yeni bir sifre belirleyin</p>
                  </div>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Yeni Sifre</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Sifre Tekrar</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={changingPassword || !newPassword || !confirmPassword}
                    className={confirmPassword && newPassword !== confirmPassword ? 'border-destructive text-destructive' : ''}
                  >
                    {changingPassword ? 'Degistiriliyor...' : 'Sifreyi Degistir'}
                  </Button>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Sifreler eslesmiyor
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-destructive/30 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-destructive/30 bg-destructive/5">
                <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide">Tehlikeli Bolge</h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Hesabi Sil</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Bu islem geri alinamaz. Tum verileriniz kalici olarak silinir.</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    Hesabi Sil
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pb-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
