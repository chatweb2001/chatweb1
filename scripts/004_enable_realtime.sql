-- Enable Realtime for tables that need live updates

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Enable realtime for conversation members
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;

-- Enable realtime for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;

-- Enable realtime for message reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Enable realtime for message reads
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;

-- Enable realtime for profiles (for online status)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
