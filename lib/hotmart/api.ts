import { createServiceClient } from '@/lib/supabase/server'

interface HotmartCredentials {
  clientId: string
  clientSecret: string
}

interface HotmartTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface HotmartSale {
  transaction: string
  buyer: {
    email: string
    name: string
  }
  purchase: {
    transaction: string
    status: string
    price?: {
      value?: number
    }
    date_next_charge?: string
    approved_date?: string
  }
  product?: {
    id?: number
    name?: string
  }
}

interface HotmartSalesPage {
  items: HotmartSale[]
  page_info: {
    next_page_token?: string
    results_per_page: number
    total_results: number
  }
}

async function getHotmartCredentials(): Promise<HotmartCredentials | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('extra_config')
    .eq('service', 'hotmart')
    .single()

  if (!data?.extra_config) return null

  const config = data.extra_config as Record<string, string>
  const clientId = config.client_id
  const clientSecret = config.client_secret

  if (!clientId || !clientSecret) return null

  return { clientId, clientSecret }
}

export async function getHotmartToken(): Promise<string | null> {
  const creds = await getHotmartCredentials()
  if (!creds) return null

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
  })

  const response = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    console.error('Hotmart OAuth error:', response.status, await response.text())
    return null
  }

  const data: HotmartTokenResponse = await response.json()
  return data.access_token
}

export async function fetchHotmartSales(
  token: string,
  pageToken?: string,
  startDate?: string,
  endDate?: string
): Promise<HotmartSalesPage | null> {
  const params = new URLSearchParams({
    max_results: '50',
  })

  if (pageToken) params.set('page_token', pageToken)
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)

  const response = await fetch(
    `https://developers.hotmart.com/payments/api/v1/sales/history?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    console.error('Hotmart sales fetch error:', response.status, await response.text())
    return null
  }

  return response.json()
}

export async function importHotmartHistory(
  startDate?: string,
  endDate?: string
): Promise<{ imported: number; skipped: number; errors: number }> {
  const token = await getHotmartToken()
  if (!token) throw new Error('Credenciais Hotmart não configuradas ou inválidas')

  const supabase = createServiceClient()
  const results = { imported: 0, skipped: 0, errors: 0 }

  let pageToken: string | undefined

  do {
    const page = await fetchHotmartSales(token, pageToken, startDate, endDate)

    if (!page || !page.items || page.items.length === 0) break

    for (const sale of page.items) {
      try {
        const email = sale.buyer?.email
        const name = sale.buyer?.name
        const transactionCode = sale.purchase?.transaction ?? sale.transaction
        const amount = sale.purchase?.price?.value
        const purchaseStatus = sale.purchase?.status?.toLowerCase()

        if (!email) {
          results.errors++
          continue
        }

        // Check if transaction already exists
        const { data: existingTx } = await supabase
          .from('transactions')
          .select('id')
          .eq('platform', 'hotmart')
          .eq('external_id', transactionCode)
          .single()

        if (existingTx) {
          results.skipped++
          continue
        }

        // Map Hotmart status to internal status
        let memberStatus = 'ativo'
        let eventType = 'purchase'
        let txStatus = 'approved'

        if (purchaseStatus === 'approved' || purchaseStatus === 'complete') {
          memberStatus = 'ativo'
          eventType = 'purchase'
          txStatus = 'approved'
        } else if (purchaseStatus === 'cancelled' || purchaseStatus === 'canceled') {
          memberStatus = 'cancelado'
          eventType = 'cancellation'
          txStatus = 'refused'
        } else if (purchaseStatus === 'refunded') {
          memberStatus = 'cancelado'
          eventType = 'refund'
          txStatus = 'refunded'
        } else if (purchaseStatus === 'chargedback') {
          memberStatus = 'cancelado'
          eventType = 'chargeback'
          txStatus = 'refunded'
        } else if (purchaseStatus === 'delayed' || purchaseStatus === 'overdue') {
          memberStatus = 'inadimplente'
          eventType = 'purchase'
          txStatus = 'pending'
        }

        // Upsert member
        const { data: member, error: memberError } = await supabase
          .from('members')
          .upsert(
            {
              email,
              name: name ?? null,
              hotmart_id: transactionCode ?? null,
              origin: 'hotmart',
              status: memberStatus,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          )
          .select()
          .single()

        if (memberError || !member) {
          results.errors++
          continue
        }

        // Insert transaction
        const transactionDate = sale.purchase?.approved_date
          ? new Date(parseInt(sale.purchase.approved_date)).toISOString()
          : new Date().toISOString()

        await supabase.from('transactions').insert({
          member_id: member.id,
          platform: 'hotmart',
          event_type: eventType,
          amount: amount ?? null,
          status: txStatus,
          transaction_date: transactionDate,
          external_id: transactionCode ?? null,
          raw_payload: sale as unknown as Record<string, unknown>,
        })

        results.imported++
      } catch (err) {
        console.error('Error importing sale:', err)
        results.errors++
      }
    }

    pageToken = page.page_info?.next_page_token
  } while (pageToken)

  return results
}
