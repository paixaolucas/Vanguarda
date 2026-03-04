import { NextRequest, NextResponse } from 'next/server'
import { importHotmartHistory } from '@/lib/hotmart/api'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { startDate, endDate } = body as { startDate?: string; endDate?: string }

    const results = await importHotmartHistory(startDate, endDate)

    return NextResponse.json({
      success: true,
      ...results,
      message: `${results.imported} transações importadas, ${results.skipped} ignoradas (duplicatas)`,
    })
  } catch (error) {
    console.error('Hotmart import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
