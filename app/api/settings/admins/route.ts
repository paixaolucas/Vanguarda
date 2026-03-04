import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/auth'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('admins').select('id, name, email, role, created_at').order('created_at')
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx || ctx.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { email, role, name } = body as { email?: string; role?: string; name?: string }

  if (!email) return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })

  // Look up user in auth by email via listUsers
  const service = createServiceClient()
  const { data: listData, error: listError } = await service.auth.admin.listUsers({ perPage: 1000 })

  if (listError) {
    return NextResponse.json({ error: 'Erro ao consultar usuários do Auth' }, { status: 500 })
  }

  const foundUser = (listData?.users ?? []).find(u => u.email === email)
  if (!foundUser) {
    return NextResponse.json({ error: 'Usuário não encontrado no Supabase Auth. Crie o usuário primeiro em Authentication → Users.' }, { status: 404 })
  }

  const userId = foundUser.id

  const { data, error } = await service
    .from('admins')
    .upsert({
      id: userId,
      email,
      name: name ?? email.split('@')[0],
      role: role ?? 'admin',
    }, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx || ctx.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { id, role } = body as { id?: string; role?: string }

  if (!id || !role) return NextResponse.json({ error: 'id e role são obrigatórios' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from('admins').update({ role }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const ctx = await getAdminContext()
  if (!ctx || ctx.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
  if (id === ctx.adminId) return NextResponse.json({ error: 'Não é possível remover seu próprio admin' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from('admins').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
