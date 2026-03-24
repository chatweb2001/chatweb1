# ChatWeb - Güvenli Mesajlaşma Uygulaması

ChatWeb, Supabase tarafından desteklenen modern, güvenli ve kullanıcı dostu bir web tabanlı mesajlaşma uygulamasıdır.

## Özellikler

### Temel Özellikleri
- ✅ Gerçek zamanlı mesajlaşma (Supabase Realtime)
- ✅ Grup sohbetleri ve özel sohbetler
- ✅ Kullanıcı profilleri ve ayarları
- ✅ Şifre sıfırlama
- ✅ Yönetici paneli ve istatistikler
- ✅ Row Level Security (RLS) ile güvenlilik

### Ileri Özellikler (Gelecek)
- Dosya ve medya paylaşımı
- Sesli mesajlar
- Emoji reaksiyonları
- Mesaj yanıtlama
- Mesaj düzenleme ve silme
- Yazıyor göstergesi
- Google, Apple ve SMS ile giriş
- Push bildirimleri

## Teknoloji Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Realtime**: Supabase Realtime
- **Authentication**: Supabase Auth

## Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Supabase projesi

### Kurulum

1. Bağımlılıkları yükleyin:
```bash
pnpm install
```

2. Environment variables ayarlayın (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

3. Veritabanı scriptlerini çalıştırın:
```bash
# Scripts dizinindeki SQL dosyaları Supabase Dashboard üzerinden çalıştırın
# 001_create_schema.sql
# 002_enable_rls.sql
# 003_create_triggers.sql
# 004_enable_realtime.sql
```

4. Geliştirme sunucusunu başlatın:
```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde açılacak.

## Proje Yapısı

```
app/
├── auth/                  # Kimlik doğrulama sayfaları
│   ├── login/
│   ├── sign-up/
│   ├── reset-password/
│   └── callback/
├── app/                   # Korumalı uygulama alanı
│   ├── page.tsx          # Ana sohbet sayfası
│   ├── profile/          # Kullanıcı profili
│   └── settings/         # Ayarlar
├── admin/                # Yönetici paneli
└── actions/              # Server actions

components/
├── chat/                 # Sohbet bileşenleri
│   ├── chat-list.tsx
│   ├── message-area.tsx
│   └── header.tsx
└── ui/                   # shadcn/ui bileşenleri

lib/
├── supabase/            # Supabase yapılandırması
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts

hooks/
├── use-auth.ts          # Kimlik doğrulama hook
└── use-chat.ts          # Sohbet hook

scripts/
├── 001_create_schema.sql      # Veritabanı şeması
├── 002_enable_rls.sql         # RLS politikaları
├── 003_create_triggers.sql    # Veritabanı triggerleri
└── 004_enable_realtime.sql    # Realtime ayarları
```

## Veritabanı Şeması

### Tablolar
- **auth.users**: Supabase Auth kullanıcıları
- **public.profiles**: Kullanıcı profilleri
- **public.conversations**: Sohbetler (özel/grup)
- **public.messages**: Mesajlar
- **public.message_reactions**: Emoji reaksiyonları
- **public.notifications**: Bildirimler
- **public.reports**: Raporlar ve istatistikler

## Güvenlik

### Row Level Security (RLS)
- Tüm tablolarda RLS etkindir
- Kullanıcılar yalnızca kendi verilerine erişebilir
- Yöneticiler tüm verileri görebilir

### Authentication
- Supabase Auth ile güvenli kimlik doğrulama
- Şifreler bcrypt ile hash'lenir
- Session yönetimi otomatik

## Kullanıcı Rolleri

### Normal Kullanıcı
- Sohbet oluşturma ve mesaj gönderme
- Profil düzenleme
- Ayarları yönetme

### Yönetici
- Tüm istatistikleri görüntüleme
- Kullanıcıları yönetme
- Sistem ayarlarını kontrol etme

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Kayıt
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/reset-password` - Şifre sıfırlama

### Sohbetler
- `GET /api/conversations` - Sohbetleri listele
- `POST /api/conversations` - Sohbet oluştur
- `GET /api/conversations/:id` - Sohbet detayları
- `PUT /api/conversations/:id` - Sohbeti güncelle
- `DELETE /api/conversations/:id` - Sohbeti sil

### Mesajlar
- `GET /api/messages/:conversationId` - Mesajları listele
- `POST /api/messages` - Mesaj gönder
- `PUT /api/messages/:id` - Mesajı düzenle
- `DELETE /api/messages/:id` - Mesajı sil

## İzinler

### Supabase OAuth Ayarları (Gelecek)
Google ve Apple OAuth'u etkinleştirmek için:
1. Supabase Dashboard → Authentication → Providers
2. Google/Apple sağlayıcısını etkinleştirin
3. Client ID ve Secret ekleyin

### SMS Doğrulama (Gelecek)
Twilio entegrasyonu için:
1. Supabase Dashboard → Auth → SMS Provider
2. Twilio hesap bilgilerini ekleyin

## Dağıtım

### Vercel'e Dağıt
1. Kodu GitHub'a push edin
2. Vercel'e bağlanın
3. Environment variables ayarlayın
4. Deploy edin

```bash
vercel deploy
```

## Sorun Giderme

### Supabase bağlantı hatası
- NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY kontrol edin
- Supabase projesi aktif olduğundan emin olun

### RLS hataları
- 002_enable_rls.sql scriptini çalıştırdığınızdan emin olun
- Supabase Dashboard → SQL Editor'da hataları kontrol edin

### Realtime çalışmıyor
- 004_enable_realtime.sql scriptini çalıştırın
- WebSocket bağlantısını kontrol edin

## Katkı

Katkılara açığız! Lütfen bir issue açın veya pull request gönderin.

## Lisans

MIT

## İletişim

Sorularınız mı var? info@chatweb.local adresine e-posta gönderin.
