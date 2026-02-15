import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rating, likedEvent, wantMore, comments } = await req.json()

  const { data: profile } = await supabase
    .from('speed_dating_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('speed_dating_feedbacks')
    .insert({
      user_id: user.id,
      profile_id: profile.id,
      rating,
      liked_event: likedEvent,
      want_more: wantMore,
      comments
    })

  if (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
