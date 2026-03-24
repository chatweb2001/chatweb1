import { createClient } from '@/lib/supabase/server'

export interface NotificationPayload {
  userId: string
  type: 'message' | 'group_invite' | 'system'
  title: string
  content: string
  conversationId?: string
  actionUrl?: string
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('notifications').insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      conversation_id: payload.conversationId,
      action_url: payload.actionUrl,
      is_read: false,
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}
