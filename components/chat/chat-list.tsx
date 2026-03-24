'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Image from 'next/image'

interface Chat {
  id: string
  name: string
  avatar_url?: string
  is_group: boolean
  last_message?: string
  last_message_at?: string
  unread_count?: number
}

interface ChatListProps {
  selectedId?: string
  onSelect: (id: string) => void
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get conversations where user is a member
    const { data: memberData } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id)

    if (!memberData || memberData.length === 0) {
      setChats([])
      setLoading(false)
      return
    }

    const conversationIds = memberData.map(m => m.conversation_id)

    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        name,
        avatar_url,
        is_group,
        messages (content, created_at)
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (data) {
      setChats(
        data.map((chat: any) => ({
          ...chat,
          name: chat.name || 'Sohbet',
          last_message: chat.messages?.[0]?.content,
          last_message_at: chat.messages?.[0]?.created_at,
        }))
      )
    }

    setLoading(false)
  }

  const createGroup = async () => {
    if (!newGroupName.trim()) return

    setCreating(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Create conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          name: newGroupName,
          is_group: true,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as admin member
      await supabase.from('conversation_members').insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'admin',
      })

      setNewGroupName('')
      setShowNewGroup(false)
      loadChats()
      onSelect(conversation.id)
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setCreating(false)
    }
  }

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Input
          type="search"
          placeholder="Sohbetleri ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Yükleniyor...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <p>Henüz sohbet yok</p>
            <p className="text-sm mt-2">Yeni bir sohbet veya grup başlatın</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelect(chat.id)}
                className={`w-full p-4 hover:bg-muted transition-colors text-left ${
                  selectedId === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex gap-3 items-center">
                  {chat.avatar_url ? (
                    <Image
                      src={chat.avatar_url}
                      alt={chat.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                      chat.is_group ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {getInitials(chat.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {chat.name}
                      </h3>
                      {chat.is_group && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          Grup
                        </span>
                      )}
                    </div>
                    {chat.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex gap-2">
        <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
          <DialogTrigger asChild>
            <Button className="flex-1" size="sm">
              Yeni Sohbet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sohbet Baslat</DialogTitle>
              <DialogDescription>
                Yeni bir sohbet baslatmak icin kullanici arayin.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="text"
                placeholder="Kullanici ara..."
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1" size="sm">
              Yeni Grup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Grup Oluştur</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Grup Adı
                </label>
                <Input
                  type="text"
                  placeholder="Grup adı girin..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <Button
                onClick={createGroup}
                disabled={creating || !newGroupName.trim()}
                className="w-full"
              >
                {creating ? 'Oluşturuluyor...' : 'Grup Oluştur'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
