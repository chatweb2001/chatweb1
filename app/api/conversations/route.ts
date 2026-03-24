import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations where user is a member
    const { data: conversations, error } = await supabase
      .from('conversation_members')
      .select(
        `
        conversation_id,
        conversations(
          id,
          name,
          avatar_url,
          is_group,
          created_at,
          created_by
        )
      `
      )
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, isGroup, memberIds = [] } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        name,
        description,
        is_group: isGroup || memberIds.length > 0,
        created_by: user.id,
      })
      .select()
      .single()

    if (convError) throw convError

    // Add creator as member
    await supabase.from('conversation_members').insert({
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'admin',
    })

    // Add other members if provided
    if (memberIds.length > 0) {
      await supabase.from('conversation_members').insert(
        memberIds.map((userId: string) => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: 'member',
        }))
      )
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
