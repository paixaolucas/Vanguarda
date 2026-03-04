import { NextRequest, NextResponse } from 'next/server'
import { syncCircleMembers, processCircleWebhookEvent } from '@/lib/circle/api'
import { validateCircleSignature, getCircleWebhookSecret } from '@/lib/circle/webhook'

// GET: trigger Circle sync
export async function GET(request: NextRequest) {
  try {
    // Basic auth check via Supabase session header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const results = await syncCircleMembers()
    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error('Circle sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

// POST: receive Circle webhooks
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()

    // Validate signature if webhook secret is configured
    const webhookSecret = await getCircleWebhookSecret()
    if (webhookSecret) {
      const signature = request.headers.get('x-circle-signature') ?? ''
      if (!validateCircleSignature(bodyText, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    }

    const payload = JSON.parse(bodyText)
    await processCircleWebhookEvent(payload)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Circle webhook error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
