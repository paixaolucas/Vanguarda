import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const origin = searchParams.get('origin')

    let query = supabase
      .from('members')
      .select('name, email, phone, status, origin, created_at, hotmart_id, tmb_id, circle_member_id')
      .order('created_at', { ascending: false })

    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    if (status) query = query.eq('status', status)
    if (origin) query = query.eq('origin', origin)

    const { data: members, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar membros' }, { status: 500 })
    }

    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Origem', 'Data de Cadastro', 'ID Hotmart', 'ID TMB', 'ID Circle']
    const rows = (members ?? []).map(m => [
      escapeCSV(m.name),
      escapeCSV(m.email),
      escapeCSV(m.phone),
      escapeCSV(m.status),
      escapeCSV(m.origin),
      escapeCSV(m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : null),
      escapeCSV(m.hotmart_id),
      escapeCSV(m.tmb_id),
      escapeCSV(m.circle_member_id),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="membros.csv"',
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
