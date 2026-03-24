import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'audio' | 'file'
  is_read: boolean
  created_at: string
  updated_at: string
}

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    const loadMessages = async () => {
      try {
        const supabase = createClient()
        const { data, error: err } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (err) throw err
        setMessages(data || [])
      } catch (err: any) {
        setError(err?.message || 'Error loading messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()

    // Subscribe to real-time updates
    const supabase = createClient()
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId])

  const sendMessage = async (content: string) => {
    if (!conversationId) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: err } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: 'text',
        is_read: false,
      })

      if (err) throw err
    } catch (err: any) {
      setError(err?.message || 'Error sending message')
    }
  }

  return { messages, loading, error, sendMessage }
}
