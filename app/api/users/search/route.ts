import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Search users by email or full_name in profiles table
    // Exclude current user from results
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .neq('id', user.id)
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)

    if (error) throw error

    return NextResponse.json(users || [])
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
