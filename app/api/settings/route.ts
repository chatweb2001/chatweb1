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

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Return default settings if none exist
    return NextResponse.json(settings || {
      id: user.id,
      theme: 'system',
      language: 'tr',
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: false,
      sound_enabled: true,
      auto_save: true,
      two_factor_enabled: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const {
      theme,
      language,
      notifications_enabled,
      email_notifications,
      push_notifications,
      sound_enabled,
      auto_save,
      two_factor_enabled,
    } = body

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('id', user.id)
      .single()

    let settings
    let error

    if (existingSettings) {
      // Update existing settings
      const result = await supabase
        .from('user_settings')
        .update({
          theme,
          language,
          notifications_enabled,
          email_notifications,
          push_notifications,
          sound_enabled,
          auto_save,
          two_factor_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      settings = result.data
      error = result.error
    } else {
      // Insert new settings
      const result = await supabase
        .from('user_settings')
        .insert({
          id: user.id,
          theme,
          language,
          notifications_enabled,
          email_notifications,
          push_notifications,
          sound_enabled,
          auto_save,
          two_factor_enabled,
        })
        .select()
        .single()

      settings = result.data
      error = result.error
    }

    if (error) throw error

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
