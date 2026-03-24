'use client'

import { useState } from 'react'
import { Header } from '@/components/chat/header'
import { ChatList } from '@/components/chat/chat-list'
import { MessageArea } from '@/components/chat/message-area'

export default function AppPage() {
  const [selectedConversation, setSelectedConversation] = useState<string>()

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex gap-0">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-sidebar flex flex-col">
          <ChatList 
            selectedId={selectedConversation} 
            onSelect={setSelectedConversation} 
          />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <MessageArea conversationId={selectedConversation} />
        </div>
      </div>
    </div>
  )
}
