'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Users, MessageCircle, X, Check } from 'lucide-react'
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

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface ChatListProps {
  selectedId?: string
  onSelect: (id: string) => void
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  // New chat states
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)
  
  // New group states
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [groupUserSearch, setGroupUserSearch] = useState('')
  const [groupSearchResults, setGroupSearchResults] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<User[]>([])
  const [groupSearchLoading, setGroupSearchLoading] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)

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

  // Search users for new chat
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const users = await response.json()
        setSearchResults(users)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Search users for group
  const searchUsersForGroup = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGroupSearchResults([])
      return
    }

    setGroupSearchLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const users = await response.json()
        // Filter out already selected members
        const filtered = users.filter(
          (u: User) => !selectedMembers.some(m => m.id === u.id)
        )
        setGroupSearchResults(filtered)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setGroupSearchLoading(false)
    }
  }, [selectedMembers])

  // Debounced search for new chat
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch, searchUsers])

  // Debounced search for group
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsersForGroup(groupUserSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [groupUserSearch, searchUsersForGroup])

  // Start direct chat with user
  const startChatWithUser = async (targetUser: User) => {
    setCreatingChat(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Check if conversation already exists between these users
      const { data: existingConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id)

      if (existingConvs && existingConvs.length > 0) {
        const convIds = existingConvs.map(c => c.conversation_id)
        
        // Check if target user is in any of these conversations (and it's not a group)
        for (const convId of convIds) {
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, is_group')
            .eq('id', convId)
            .eq('is_group', false)
            .single()

          if (conv) {
            const { data: targetMember } = await supabase
              .from('conversation_members')
              .select('user_id')
              .eq('conversation_id', conv.id)
              .eq('user_id', targetUser.id)
              .single()

            if (targetMember) {
              // Conversation already exists
              setShowNewChat(false)
              setUserSearch('')
              setSearchResults([])
              onSelect(conv.id)
              return
            }
          }
        }
      }

      // Create new conversation
      const chatName = targetUser.full_name || targetUser.email
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          name: chatName,
          is_group: false,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Add both users as members
      await supabase.from('conversation_members').insert([
        { conversation_id: conversation.id, user_id: user.id, role: 'member' },
        { conversation_id: conversation.id, user_id: targetUser.id, role: 'member' },
      ])

      setShowNewChat(false)
      setUserSearch('')
      setSearchResults([])
      loadChats()
      onSelect(conversation.id)
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setCreatingChat(false)
    }
  }

  // Add member to group selection
  const addMemberToGroup = (user: User) => {
    setSelectedMembers(prev => [...prev, user])
    setGroupSearchResults(prev => prev.filter(u => u.id !== user.id))
    setGroupUserSearch('')
  }

  // Remove member from group selection
  const removeMemberFromGroup = (userId: string) => {
    setSelectedMembers(prev => prev.filter(u => u.id !== userId))
  }

  // Create group
  const createGroup = async () => {
    if (!newGroupName.trim()) return

    setCreatingGroup(true)
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

      // Add creator as admin
      const membersToAdd = [
        { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
        ...selectedMembers.map(m => ({
          conversation_id: conversation.id,
          user_id: m.id,
          role: 'member',
        }))
      ]

      await supabase.from('conversation_members').insert(membersToAdd)

      // Reset and close
      setNewGroupName('')
      setSelectedMembers([])
      setShowNewGroup(false)
      loadChats()
      onSelect(conversation.id)
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setCreatingGroup(false)
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

  const getUserDisplayName = (user: User) => {
    return user.full_name || user.email
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Sohbetleri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Yukleniyor...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p>Henuz sohbet yok</p>
            <p className="text-sm mt-2">Yeni bir sohbet veya grup baslatin</p>
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
                      {chat.is_group ? <Users className="h-5 w-5" /> : getInitials(chat.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {chat.name}
                      </h3>
                      {chat.is_group && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
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
        {/* New Chat Dialog */}
        <Dialog open={showNewChat} onOpenChange={(open) => {
          setShowNewChat(open)
          if (!open) {
            setUserSearch('')
            setSearchResults([])
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex-1" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Yeni Sohbet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Sohbet Baslat</DialogTitle>
              <DialogDescription>
                Sohbet baslatmak icin bir kullanici arayin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="E-posta veya isim ile ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <ScrollArea className="h-64">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Araniyor...
                  </div>
                ) : searchResults.length === 0 && userSearch ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
                    <p>Kullanici bulunamadi</p>
                    <p className="text-sm mt-1">Baska bir arama deneyin</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p>Kullanici aramaya baslayin</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => startChatWithUser(user)}
                        disabled={creatingChat}
                        className="w-full p-3 rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3"
                      >
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={getUserDisplayName(user)}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                            {getInitials(getUserDisplayName(user))}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {user.full_name || 'Kullanici'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Group Dialog */}
        <Dialog open={showNewGroup} onOpenChange={(open) => {
          setShowNewGroup(open)
          if (!open) {
            setNewGroupName('')
            setGroupUserSearch('')
            setGroupSearchResults([])
            setSelectedMembers([])
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Yeni Grup
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Grup Olustur</DialogTitle>
              <DialogDescription>
                Grup adi girin ve uyeleri ekleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Grup Adi</label>
                <Input
                  type="text"
                  placeholder="Grup adini girin..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secilen Uyeler ({selectedMembers.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                      >
                        <span>{member.full_name || member.email}</span>
                        <button
                          onClick={() => removeMemberFromGroup(member.id)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Users for Group */}
              <div>
                <label className="block text-sm font-medium mb-2">Uye Ekle</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="E-posta veya isim ile ara..."
                    value={groupUserSearch}
                    onChange={(e) => setGroupUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="h-40">
                {groupSearchLoading ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    Araniyor...
                  </div>
                ) : groupSearchResults.length > 0 ? (
                  <div className="space-y-1">
                    {groupSearchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => addMemberToGroup(user)}
                        className="w-full p-2 rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3"
                      >
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={getUserDisplayName(user)}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {getInitials(getUserDisplayName(user))}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.full_name || 'Kullanici'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <Check className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : groupUserSearch ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                    Kullanici bulunamadi
                  </div>
                ) : null}
              </ScrollArea>

              <Button
                onClick={createGroup}
                disabled={creatingGroup || !newGroupName.trim()}
                className="w-full"
              >
                {creatingGroup ? 'Olusturuluyor...' : 'Grup Olustur'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
