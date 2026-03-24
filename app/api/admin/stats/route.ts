import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get statistics
    const [
      { count: totalUsers },
      { count: totalConversations },
      { count: totalMessages },
      { data: todayStats },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase
        .from('app_statistics')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single(),
    ])

    return NextResponse.json({
      totalUsers,
      totalConversations,
      totalMessages,
      todayStats,
      averageMessagesPerUser:
        totalUsers && totalMessages
          ? Math.round(totalMessages / totalUsers)
          : 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
