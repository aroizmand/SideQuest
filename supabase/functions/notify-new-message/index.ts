import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { quest_id, sender_id, sender_name, body, quest_title } = await req.json()

  if (!quest_id || !sender_id || !body) {
    return new Response('Missing required fields', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get all quest members except the sender
  const { data: members } = await supabase
    .from('fact_quest_memberships')
    .select('user_id')
    .eq('quest_id', quest_id)
    .neq('user_id', sender_id)

  if (!members?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  const memberIds = members.map((m) => m.user_id)

  // Get their push tokens
  const { data: users } = await supabase
    .from('dim_user')
    .select('user_id, expo_push_token')
    .in('user_id', memberIds)
    .not('expo_push_token', 'is', null)

  const eligible = users?.filter((u) => u.expo_push_token) ?? []
  if (!eligible.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Build Expo push messages
  const messages = eligible.map((u) => ({
    to: u.expo_push_token,
    title: quest_title ?? 'New message',
    body: `${sender_name}: ${body}`,
    data: { quest_id, quest_title },
    sound: 'default',
    channelId: 'messages',
  }))

  // Send to Expo push service
  const accessToken = Deno.env.get('EXPO_PUSH_ACCESS_TOKEN')
  const expoRes = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(messages),
  })
  const expoData = await expoRes.json()
  console.log('Expo push response:', JSON.stringify(expoData))

  // Log to notification_log
  const now = new Date().toISOString()
  await supabase.from('notification_log').insert(
    eligible.map((u) => ({
      user_id: u.user_id,
      type: 'new_message',
      payload: { quest_id, quest_title, sender_name, preview: body.slice(0, 100) },
      sent_at: now,
    }))
  )

  return new Response(
    JSON.stringify({ sent: eligible.length, expo: expoData }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
