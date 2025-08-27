import crypto from 'node:crypto'

type CreateInvoiceInput = {
  amountSats: number
  orderId: string
  productId: string
  buyerEmail?: string
  redirectURL?: string
}

type CreateInvoiceResult = {
  id: string
  checkoutLink: string
}

const baseUrl = process.env.BTCPAY_URL!
const apiKey = process.env.BTCPAY_API_KEY!
const storeId = process.env.BTCPAY_STORE_ID!

function satsToBtc(sats: number) {
  return (sats / 1e8).toFixed(8)
}

export async function createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  if (!baseUrl || !apiKey || !storeId) {
    throw new Error('BTCPAY_URL, BTCPAY_API_KEY, BTCPAY_STORE_ID must be set')
  }

  const url = `${baseUrl}/api/v1/stores/${storeId}/invoices`
  const body: any = {
    amount: Number(satsToBtc(input.amountSats)),
    currency: 'BTC',
    metadata: {
      orderId: input.orderId,
      productId: input.productId,
      buyerEmail: input.buyerEmail ?? null
    }
  }
  if (input.redirectURL) {
    body.checkout = { redirectURL: input.redirectURL, redirectAutomatically: true }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`BTCPay create invoice failed: ${res.status} ${res.statusText} ${err}`)
  }

  const data = await res.json()
  return { id: data.id, checkoutLink: data.checkoutLink }
}

export function verifyWebhookSignature(rawBody: string, sigHeader?: string | null) {
  const secret = process.env.BTCPAY_WEBHOOK_SECRET
  if (!secret) return false
  if (!sigHeader) return false

  const presented = sigHeader.replace(/^sha256=/i, '').trim()
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(presented), Buffer.from(hmac))
}


