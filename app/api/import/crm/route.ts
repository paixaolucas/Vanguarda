import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CrmRow {
  name?: string
  email?: string
  phone?: string
  origin?: string
  hotmart_id?: string
  tmb_id?: string
  circle_member_id?: string
  [key: string]: string | undefined
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const rows: CrmRow[] = body.rows ?? []

    if (!rows.length) {
      return NextResponse.json({ error: 'Nenhuma linha recebida' }, { status: 400 })
    }

    const results = { updated: 0, created: 0, skipped: 0, errors: 0 }

    for (const row of rows) {
      try {
        const email = row.email?.trim().toLowerCase()
        if (!email) {
          results.skipped++
          continue
        }

        // Build update payload — only include non-empty values
        const payload: Record<string, string> = { email }
        if (row.name?.trim()) payload.name = row.name.trim()
        if (row.phone?.trim()) payload.phone = row.phone.trim()
        if (row.origin?.trim()) payload.origin = row.origin.trim()
        if (row.hotmart_id?.trim()) payload.hotmart_id = row.hotmart_id.trim()
        if (row.tmb_id?.trim()) payload.tmb_id = row.tmb_id.trim()
        if (row.circle_member_id?.trim()) payload.circle_member_id = row.circle_member_id.trim()

        // Check if member exists
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('email', email)
          .single()

        if (existing) {
          // Update existing member (only fill in missing/empty fields)
          const { data: current } = await supabase
            .from('members')
            .select('name, phone, origin, hotmart_id, tmb_id, circle_member_id')
            .eq('id', existing.id)
            .single()

          const updates: Record<string, string> = { updated_at: new Date().toISOString() }
          // Only update fields that are currently null/empty
          if (!current?.name && payload.name) updates.name = payload.name
          if (!current?.phone && payload.phone) updates.phone = payload.phone
          if (!current?.origin && payload.origin) updates.origin = payload.origin
          if (!current?.hotmart_id && payload.hotmart_id) updates.hotmart_id = payload.hotmart_id
          if (!current?.tmb_id && payload.tmb_id) updates.tmb_id = payload.tmb_id
          if (!current?.circle_member_id && payload.circle_member_id) updates.circle_member_id = payload.circle_member_id

          if (Object.keys(updates).length > 1) {
            await supabase.from('members').update(updates).eq('id', existing.id)
          }
          results.updated++
        } else {
          // Create new member
          await supabase.from('members').insert({
            ...payload,
            status: 'ativo',
            origin: payload.origin || 'manual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          results.created++
        }
      } catch (err) {
        console.error('Row import error:', err)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `${results.updated} atualizados, ${results.created} criados, ${results.skipped} ignorados (sem email)`,
    })
  } catch (error) {
    console.error('CRM import error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
