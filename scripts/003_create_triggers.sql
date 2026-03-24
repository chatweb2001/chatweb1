-- Trigger functions for ChatWeb

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp on profile changes
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Update conversation timestamp when new message arrives
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- Clean up old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.typing_indicators
  WHERE started_at < NOW() - INTERVAL '10 seconds';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_typing ON public.typing_indicators;
CREATE TRIGGER cleanup_typing
  AFTER INSERT ON public.typing_indicators
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_typing_indicators();

-- Update daily statistics
CREATE OR REPLACE FUNCTION public.update_daily_statistics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  total_users_count INTEGER;
  active_users_count INTEGER;
  new_users_count INTEGER;
  total_messages_count INTEGER;
  total_conversations_count INTEGER;
  total_groups_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users_count FROM public.profiles;
  SELECT COUNT(*) INTO active_users_count FROM public.profiles WHERE last_seen > NOW() - INTERVAL '24 hours';
  SELECT COUNT(*) INTO new_users_count FROM public.profiles WHERE DATE(created_at) = today;
  SELECT COUNT(*) INTO total_messages_count FROM public.messages;
  SELECT COUNT(*) INTO total_conversations_count FROM public.conversations WHERE is_group = false;
  SELECT COUNT(*) INTO total_groups_count FROM public.conversations WHERE is_group = true;

  INSERT INTO public.app_statistics (date, total_users, active_users, new_users, total_messages, total_conversations, total_groups)
  VALUES (today, total_users_count, active_users_count, new_users_count, total_messages_count, total_conversations_count, total_groups_count)
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_users = EXCLUDED.new_users,
    total_messages = EXCLUDED.total_messages,
    total_conversations = EXCLUDED.total_conversations,
    total_groups = EXCLUDED.total_groups;
END;
$$;
