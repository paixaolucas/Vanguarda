import { NextRequest, NextResponse } from 'next/server'
import { validateHotmartSignature, processHotmartEvent } from '@/lib/hotmart/webhook'

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-hotmart-signature') ?? ''
    const secret = process.env.HOTMART_WEBHOOK_SECRET ?? ''

    if (secret && !validateHotmartSignature(bodyText, signature, secret)) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

    const payload = JSON.parse(bodyText)
    await processHotmartEvent(payload)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Hotmart webhook error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
