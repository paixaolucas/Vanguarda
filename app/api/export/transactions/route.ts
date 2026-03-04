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

function formatCurrency(value: number | null | undefined): string {
  if (!value) return '0'
  return value.toFixed(2).replace('.', ',')
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
      .from('transactions')
      .select('*, members(name, email)')
      .order('transaction_date', { ascending: false })

    if (platform) query = query.eq('platform', platform)
    if (status) query = query.eq('status', status)
    if (from) query = query.gte('transaction_date', from)
    if (to) query = query.lte('transaction_date', to)

    const { data: transactions, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar transações' }, { status: 500 })
    }

    const headers = ['Membro', 'Email', 'Plataforma', 'Evento', 'Status', 'Valor (R$)', 'Data']
    const rows = (transactions ?? []).map(tx => {
      const member = tx.members as { name: string | null; email: string | null } | null
      return [
        escapeCSV(member?.name),
        escapeCSV(member?.email),
        escapeCSV(tx.platform),
        escapeCSV(tx.event_type),
        escapeCSV(tx.status),
        formatCurrency(tx.amount),
        escapeCSV(tx.transaction_date ? new Date(tx.transaction_date).toLocaleString('pt-BR') : null),
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transacoes.csv"',
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
