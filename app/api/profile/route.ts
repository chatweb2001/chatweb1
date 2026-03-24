import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json(profile || { 
      id: user.id, 
      email: user.email,
      full_name: null,
      avatar_url: null,
      bio: null,
      phone: null,
      location: null,
      website: null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, avatar_url, bio, phone, location, website } = body

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    let profile
    let error

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('profiles')
        .update({
          full_name,
          avatar_url,
          bio,
          phone,
          location,
          website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      profile = result.data
      error = result.error
    } else {
      // Insert new profile
      const result = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name,
          avatar_url,
          bio,
          phone,
          location,
          website,
        })
        .select()
        .single()

      profile = result.data
      error = result.error
    }

    if (error) throw error

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
