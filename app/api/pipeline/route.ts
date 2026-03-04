import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, members(id, name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const body = await request.json()

  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      member_id: body.member_id,
      notes: body.notes ?? null,
      due_date: body.due_date ?? null,
      status: 'para_contatar',
      created_by: user?.id ?? null,
    })
    .select('*, members(id, name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
