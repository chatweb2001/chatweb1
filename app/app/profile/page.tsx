'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/chat/header'
import { User, MapPin, Phone, Globe, FileText, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface Profile {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  location: string | null
  website: string | null
}

type ToastState = { type: 'success' | 'error'; message: string } | null

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [activeSection, setActiveSection] = useState('genel')

  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    avatar_url: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { setLoading(false); return }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || '',
          avatar_url: data.avatar_url || '',
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
          display_name: formData.display_name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      showToast('success', 'Profil basariyla kaydedildi')
    } catch {
      showToast('error', 'Kaydedilirken bir hata olustu')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = () => {
    const name = formData.display_name || formData.full_name
    if (name) return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const navItems = [
    { id: 'genel', label: 'Genel Bilgiler', icon: User },
    { id: 'iletisim', label: 'Iletisim', icon: Phone },
    { id: 'hakkimda', label: 'Hakkimda', icon: FileText },
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
            <div className="flex flex-col items-center gap-3">
              {formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Avatar"
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">{getInitials()}</span>
                </div>
              )}
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm leading-tight">
                  {formData.display_name || formData.full_name || 'Kullanici'}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user?.email}</p>
              </div>
            </div>
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <form onSubmit={handleSave} className="max-w-2xl mx-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Profil</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Kisisel bilgilerinizi guncelleyin</p>
              </div>
              <Button type="submit" disabled={saving} size="sm">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>

            {/* Avatar Section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Profil Fotografi</h2>
              <div className="flex items-center gap-5">
                {formData.avatar_url ? (
                  <Image
                    src={formData.avatar_url}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-foreground">{getInitials()}</span>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Profil fotografi icin bir URL girin</p>
                </div>
              </div>
            </div>

            {/* General Info */}
            {(activeSection === 'genel' || true) && (
              <>
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Genel Bilgiler</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Ad Soyad
                      </label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Adiniz Soyadiniz"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Goruntuleme Adi
                      </label>
                      <Input
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="@kullanici"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      E-posta
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">E-posta adresi degistirilemez</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Iletisim</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Telefon
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+90 555 123 45 67"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Konum
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Istanbul, Turkiye"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Web Sitesi
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Hakkimda</h2>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      Biyografi
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Kendinizi kisaca tanitin..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">{formData.bio.length}/300 karakter</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pb-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
