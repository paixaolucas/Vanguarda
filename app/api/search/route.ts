import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ members: [] })
  }

  const supabase = await createClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, name, email, phone, status')
    .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    .limit(8)

  return NextResponse.json({ members: members ?? [] })
}
