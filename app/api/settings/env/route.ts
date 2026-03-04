import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'

const ENV_PATH = path.join(process.cwd(), '.env.local')
const IS_VERCEL = process.env.VERCEL === '1'

function readEnvFile(): Record<string, string> {
  try {
    const content = fs.readFileSync(ENV_PATH, 'utf-8')
    const result: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      result[key] = value
    }
    return result
  } catch {
    return {}
  }
}

function writeEnvFile(vars: Record<string, string>) {
  const lines = Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
  fs.writeFileSync(ENV_PATH, lines + '\n', 'utf-8')
}

// Se Supabase já está configurado, exige sessão autenticada
async function requireAuthIfConfigured(): Promise<NextResponse | null> {
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!configured) return null // setup inicial — permitir sem auth
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  return null
}

export async function GET() {
  const authError = await requireAuthIfConfigured()
  if (authError) return authError

  const vars = IS_VERCEL ? {} : readEnvFile()
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: vars['NEXT_PUBLIC_SUPABASE_URL'] ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    SUPABASE_SERVICE_ROLE_KEY: vars['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
    isVercel: IS_VERCEL,
  })
}

export async function POST(request: NextRequest) {
  const authError = await requireAuthIfConfigured()
  if (authError) return authError

  try {
    const body = await request.json()
    const { url, anonKey, serviceKey, vercelToken } = body as {
      url?: string
      anonKey?: string
      serviceKey?: string
      vercelToken?: string
    }

    if (!url?.trim() || !anonKey?.trim() || !serviceKey?.trim()) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }

    if (IS_VERCEL) {
      if (!vercelToken?.trim()) {
        return NextResponse.json({ error: 'Vercel Token é obrigatório no ambiente Vercel.' }, { status: 400 })
      }

      const projectId = process.env.VERCEL_PROJECT_ID
      if (!projectId) {
        return NextResponse.json({ error: 'VERCEL_PROJECT_ID não encontrado.' }, { status: 500 })
      }

      const teamId = process.env.VERCEL_TEAM_ID || undefined

      const { upsertVercelEnvVar, triggerVercelRedeploy } = await import('@/lib/vercel/api')

      await upsertVercelEnvVar(vercelToken, projectId, 'NEXT_PUBLIC_SUPABASE_URL', url.trim(), teamId)
      await upsertVercelEnvVar(vercelToken, projectId, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey.trim(), teamId)
      await upsertVercelEnvVar(vercelToken, projectId, 'SUPABASE_SERVICE_ROLE_KEY', serviceKey.trim(), teamId)
      await triggerVercelRedeploy(vercelToken, projectId, teamId)

      return NextResponse.json({
        success: true,
        message: 'Variáveis salvas. Redeploy iniciado no Vercel.',
      })
    }

    // Self-hosted: escrever .env.local
    const current = readEnvFile()
    current['NEXT_PUBLIC_SUPABASE_URL'] = url.trim()
    current['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = anonKey.trim()
    current['SUPABASE_SERVICE_ROLE_KEY'] = serviceKey.trim()
    writeEnvFile(current)

    return NextResponse.json({
      success: true,
      message: 'Salvo. Reinicie o servidor para aplicar as mudanças.',
    })
  } catch (error) {
    console.error('Env write error:', error)
    const message = error instanceof Error ? error.message : 'Erro ao salvar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
