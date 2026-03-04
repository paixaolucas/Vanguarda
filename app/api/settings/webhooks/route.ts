import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { event_type, url, headers } = body as {
    event_type?: string
    url?: string
    headers?: Record<string, string>
  }

  if (!event_type || !url) {
    return NextResponse.json({ error: 'event_type e url são obrigatórios' }, { status: 400 })
  }

  try { new URL(url) } catch {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .insert({ event_type, url, headers: headers ?? {}, active: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
