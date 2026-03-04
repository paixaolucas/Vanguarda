import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ENV_PATH = path.join(process.cwd(), '.env.local')

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

export async function GET() {
  const vars = readEnvFile()
  // Return only Supabase keys, masked where sensitive
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: vars['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
    SUPABASE_SERVICE_ROLE_KEY: vars['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, anonKey, serviceKey } = body as {
      url?: string
      anonKey?: string
      serviceKey?: string
    }

    const current = readEnvFile()

    if (url !== undefined && url.trim()) current['NEXT_PUBLIC_SUPABASE_URL'] = url.trim()
    if (anonKey !== undefined && anonKey.trim()) current['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = anonKey.trim()
    if (serviceKey !== undefined && serviceKey.trim()) current['SUPABASE_SERVICE_ROLE_KEY'] = serviceKey.trim()

    writeEnvFile(current)

    return NextResponse.json({
      success: true,
      message: 'Salvo. Reinicie o servidor para aplicar as mudanças.',
    })
  } catch (error) {
    console.error('Env write error:', error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}
