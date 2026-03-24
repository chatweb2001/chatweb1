# ChatWeb - Kurulum Rehberi

Bu rehber, ChatWeb uygulamasını sıfırdan kurmak için gerekli tüm adımları içerir.

## 1. Supabase Projesi Oluşturma

### Adım 1.1: Supabase Dashboard
1. [supabase.com](https://supabase.com) adresine gidin
2. Oturum açın veya hesap oluşturun
3. "New Project" butonuna tıklayın
4. Proje adını girin (örn. "ChatWeb")
5. Güvenli bir veritabanı şifresi belirleyin
6. Projeyi oluşturun

### Adım 1.2: API Keys
1. Proje dashboard'ında "Settings" → "API" gidin
2. "Project URL" ve "Anon Key" değerlerini kopyalayın
3. `.env.local` dosyasına ekleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=<proje_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

## 2. Veritabanı Şeması Oluşturma

### Adım 2.1: SQL Editor
1. Supabase Dashboard'da "SQL Editor" seçeneğine gidin
2. "New Query" butonuna tıklayın

### Adım 2.2: Şema Oluşturma
Aşağıdaki SQL dosyalarını sırasıyla çalıştırın:

1. **001_create_schema.sql** - Temel tablolar
```sql
-- /scripts/001_create_schema.sql dosyasının içeriğini buraya yapıştırın
```

2. **002_enable_rls.sql** - Row Level Security
```sql
-- /scripts/002_enable_rls.sql dosyasının içeriğini buraya yapıştırın
```

3. **003_create_triggers.sql** - Otomatik fonksiyonlar
```sql
-- /scripts/003_create_triggers.sql dosyasının içeriğini buraya yapıştırın
```

4. **004_enable_realtime.sql** - Realtime konfigürasyonu
```sql
-- /scripts/004_enable_realtime.sql dosyasının içeriğini buraya yapıştırın
```

## 3. Authentication Ayarları

### Adım 3.1: Email Provider
1. Supabase Dashboard → "Authentication" → "Providers"
2. "Email" önceden etkindir, yapılandırma gerekmez

### Adım 3.2: OAuth Providers (Opsiyonel)

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) açın
2. Yeni bir proje oluşturun
3. OAuth 2.0 kimlik bilgilerini oluşturun
4. Supabase Dashboard'da "Google" sağlayıcısını etkinleştirin
5. Client ID ve Secret'ı yapıştırın

#### Apple Sign In (Opsiyonel)
1. [Apple Developer](https://developer.apple.com) hesabınıza gidin
2. Certificates, Identifiers & Profiles'ı açın
3. Sign in with Apple oluşturun
4. Supabase Dashboard'da "Apple" sağlayıcısını etkinleştirin

### Adım 3.3: SMS Provider (Opsiyonel)
1. [Twilio](https://www.twilio.com) hesabı oluşturun
2. Twilio credentials'ı alın
3. Supabase Dashboard → "Authentication" → "Providers" → SMS
4. Twilio bilgilerini girin

## 4. Storage Ayarları

### Adım 4.1: Avatars Bucket
1. Supabase Dashboard → "Storage"
2. "New Bucket" tıklayın
3. Ad: "avatars"
4. "Public bucket" seçeneğini etkinleştirin
5. Oluşturun

### Adım 4.2: Files Bucket
1. Yeni bir bucket oluşturun
2. Ad: "files"
3. Opsiyonel: "Public bucket" etkinleştirin

## 5. Yerel Geliştirme Ortamı

### Adım 5.1: Bağımlılıkları Yükleyin
```bash
cd chatweb
pnpm install
```

### Adım 5.2: Environment Variables
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### Adım 5.3: Geliştirme Sunucusu
```bash
pnpm dev
```

Uygulamaya `http://localhost:3000` adresinden erişin.

## 6. İlk Kullanıcı Oluşturma

1. Anasayfaya gidin
2. "Kayıt Ol" butonuna tıklayın
3. E-posta ve şifre girin
4. Supabase Dashboard'da "Auth" sekmesinde yeni kullanıcıyı görebilirsiniz

### Admin Kullanıcı Yapma
1. Supabase Dashboard → "SQL Editor"
2. Yeni query açın:
```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE id = '<user_id>';
```

## 7. İstatistikleri Başlatma

Yönetici panelinde istatistikleri görmek için:

```sql
INSERT INTO public.app_statistics (
  date, total_users, active_users, new_users, 
  total_messages, total_conversations, total_groups
) VALUES (
  CURRENT_DATE, 0, 0, 0, 0, 0, 0
) ON CONFLICT (date) DO NOTHING;
```

## 8. Üretim Dağıtımı

### Adım 8.1: Vercel Dağıtımı
1. GitHub'a push yapın
2. Vercel'e bağlanın
3. Environment variables ayarlayın:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (production URL'iniz)

### Adım 8.2: Supabase Üretim Yapılandırması
1. Supabase Dashboard → Settings → Database
2. Backup özellikleri etkinleştirin
3. Email templates özelleştirin (isteğe bağlı)

## 9. Sorun Giderme

### "NEXT_PUBLIC_SUPABASE_URL is required" hatası
- `.env.local` dosyasını kontrol edin
- Değerleri Supabase Dashboard'dan yeniden kopyalayın

### Veritabanı bağlantı hatası
- Supabase projesi çalışır durumda mı?
- API anahtarları doğru mu?
- Veritabanı scripts çalıştırıldı mı?

### RLS politikaları uygulanmıyor
- 002_enable_rls.sql çalıştırıldığından emin olun
- Supabase Dashboard → Tables → Public etiğini kontrol edin

### Realtime çalışmıyor
- WebSocket bağlantısını kontrol edin
- 004_enable_realtime.sql çalıştırıldığından emin olun

## 10. İpuçları ve En İyi Uygulamalar

1. **Düzenli backuplar**: Supabase otomatik backuplar alır
2. **Şifre güvenliği**: Güçlü şifreler kullanın
3. **Rate limiting**: Production'da rate limiting etkinleştirin
4. **CORS ayarları**: Uygun CORS politikaları ayarlayın
5. **Logging**: Hataları izlemek için logging etkinleştirin

## Daha Fazla Yardım

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [ChatWeb Issues](https://github.com/yourusername/chatweb/issues)
