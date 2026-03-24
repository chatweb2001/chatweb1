-- Create user settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  message_sound BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('auto', 'light', 'dark')),
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en')),
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "settings_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "settings_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "settings_delete_own" ON public.user_settings;

-- Create RLS policies
CREATE POLICY "settings_select_own" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "settings_insert_own" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "settings_update_own" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "settings_delete_own" ON public.user_settings
  FOR DELETE USING (auth.uid() = id);

-- Create function to handle settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;

-- Create trigger to auto-create settings on signup
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();
