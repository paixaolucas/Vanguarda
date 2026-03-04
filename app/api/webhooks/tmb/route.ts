import { NextRequest, NextResponse } from 'next/server'
import { validateTmbSignature, processTmbEvent } from '@/lib/tmb/webhook'

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-tmb-signature')
      ?? request.headers.get('x-hub-signature-256')
      ?? ''
    const secret = process.env.TMB_WEBHOOK_SECRET ?? ''

    if (secret && !validateTmbSignature(bodyText, signature, secret)) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

    const payload = JSON.parse(bodyText)
    await processTmbEvent(payload)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('TMB webhook error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
