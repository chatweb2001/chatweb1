-- Enable Row Level Security for all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_statistics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY "conversations_select_member" ON public.conversations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = id AND user_id = auth.uid()
  ));
CREATE POLICY "conversations_insert_auth" ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "conversations_update_admin" ON public.conversations FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = id AND user_id = auth.uid() AND role = 'admin'
  ) OR created_by = auth.uid());
CREATE POLICY "conversations_delete_admin" ON public.conversations FOR DELETE 
  USING (created_by = auth.uid());

-- Conversation members policies
CREATE POLICY "conversation_members_select" ON public.conversation_members FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = conversation_id AND cm.user_id = auth.uid()
  ));
CREATE POLICY "conversation_members_insert" ON public.conversation_members FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "conversation_members_update_own" ON public.conversation_members FOR UPDATE 
  USING (user_id = auth.uid());
CREATE POLICY "conversation_members_delete" ON public.conversation_members FOR DELETE 
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversation_members cm 
    WHERE cm.conversation_id = conversation_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  ));

-- Messages policies
CREATE POLICY "messages_select_member" ON public.messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  ));
CREATE POLICY "messages_insert_member" ON public.messages FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  ) AND sender_id = auth.uid());
CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE 
  USING (sender_id = auth.uid());
CREATE POLICY "messages_delete_own" ON public.messages FOR DELETE 
  USING (sender_id = auth.uid());

-- Message reactions policies
CREATE POLICY "reactions_select" ON public.message_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert_auth" ON public.message_reactions FOR INSERT 
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "reactions_delete_own" ON public.message_reactions FOR DELETE 
  USING (user_id = auth.uid());

-- Message reads policies
CREATE POLICY "reads_select" ON public.message_reads FOR SELECT USING (true);
CREATE POLICY "reads_insert_own" ON public.message_reads FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Typing indicators policies
CREATE POLICY "typing_select_member" ON public.typing_indicators FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversation_members 
    WHERE conversation_id = typing_indicators.conversation_id AND user_id = auth.uid()
  ));
CREATE POLICY "typing_insert_own" ON public.typing_indicators FOR INSERT 
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "typing_delete_own" ON public.typing_indicators FOR DELETE 
  USING (user_id = auth.uid());

-- User blocks policies
CREATE POLICY "blocks_select_own" ON public.user_blocks FOR SELECT 
  USING (blocker_id = auth.uid() OR blocked_id = auth.uid());
CREATE POLICY "blocks_insert_own" ON public.user_blocks FOR INSERT 
  WITH CHECK (blocker_id = auth.uid());
CREATE POLICY "blocks_delete_own" ON public.user_blocks FOR DELETE 
  USING (blocker_id = auth.uid());

-- Reports policies
CREATE POLICY "reports_select_own_or_admin" ON public.reports FOR SELECT 
  USING (reporter_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));
CREATE POLICY "reports_insert_auth" ON public.reports FOR INSERT 
  WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Admin notifications policies (admin only)
CREATE POLICY "admin_notifications_select_admin" ON public.admin_notifications FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));
CREATE POLICY "admin_notifications_all_admin" ON public.admin_notifications FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- App statistics policies (admin only)
CREATE POLICY "statistics_select_admin" ON public.app_statistics FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));
CREATE POLICY "statistics_all_admin" ON public.app_statistics FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));
