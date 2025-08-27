
# Bitcoin-Only Digital Marketplace (MVP)

A lightweight marketplace for digital products where buyers pay in Bitcoin (sats) and sellers host or upload their files. The platform handles **Lightning payments** and **secure temporary downloads** for purchased products.

---

## 🏗 Architecture Overview

**Frontend / Backend:** Nuxt 4 (server routes for API)  
**Database:** SQLite/PostgreSQL via Prisma ORM  
**Payment Processor:** BTCPay Server (Lightning invoices)  
**File Storage:** Marketplace-hosted (local filesystem for MVP); seller-hosted via S3-compatible storage as upgrade  
**Delivery System:** Temporary download links (time-limited, one-time access)

---

## ⚡ Features (MVP)

**Seller:**  
- Register/login and create a product listing  
- Upload a digital product (max 100 MB for free plan)  
- Set price in sats  
- View sales & download stats  

**Buyer:**  
- Browse marketplace listings  
- Pay in Bitcoin via Lightning invoice  
- Receive secure, temporary download link after payment  

**Marketplace:**  
- Generates Lightning invoices via BTCPay API  
- Validates payment using webhook  
- Generates temporary download links after payment confirmation  
- Free plan: 1 product per seller, max 100 MB  
- Optional donations/tips  

---

## 🗂 Database Schema (Simplified)

| Table | Fields |
|-------|--------|
| sellers | id, username, email, wallet_address, plan_type, balance_sats |
| products | id, seller_id, title, description, sats_price, file_path |
| orders | id, product_id, buyer_info, invoice_id, status, sats_paid, fee_sats |
| download_tokens | token, order_id, product_id, file_path, expires_at, used |
| withdrawals | id, seller_id, sats, status |

---

## ⚙️ MVP Flow

1. Seller registers → adds a product → uploads file  
2. Product goes live → visible in marketplace  
3. Buyer clicks **Buy** → Lightning invoice is generated  
4. Buyer pays → BTCPay webhook confirms payment  
5. Marketplace deducts marketplace fee, credits seller balance, and generates **temporary download token**  
6. Buyer downloads file via `/download/{token}`  
7. Token expires automatically (time-limited and/or one-time use)  

---

## 🔧 Setup

### Prerequisites
- Node.js 20+  
- Nuxt 4  
- PostgreSQL or SQLite  
- BTCPay Server instance  
- VPS or server for file storage  

### Steps
1. Clone the repository:  
```bash
git clone https://github.com/yourrepo/bitcoin-marketplace.git
cd bitcoin-marketplace
```

2. Install dependencies:  
```bash
npm install
```

3. Configure environment variables (`.env`):  
```env
# BTCPay Server
BTCPAY_URL=
BTCPAY_API_KEY=
BTCPAY_STORE_ID=
BTCPAY_WEBHOOK_SECRET=

# Storage (MVP: local filesystem)
STORAGE_DRIVER=local
UPLOAD_PATH=./uploads

# Download tokens
TOKEN_EXPIRY=3600
DOWNLOAD_MAX_ATTEMPTS=1

# Marketplace
MARKETPLACE_FEE_PERCENT=5
MIN_WITHDRAW_SATS=50000

# Optional: MinIO (for upgrade path)
# MINIO_ENDPOINT=
# MINIO_KEY=
# MINIO_SECRET=
# MINIO_REGION=us-east-1
```

4. Run database migrations (Prisma):  
```bash
npx prisma migrate dev --name init
```

5. Start development server:  
```bash
npm run dev
```

6. Upload files are stored under `${UPLOAD_PATH}/{seller_id}/{product_id}` for free plan products.

---

## 🔐 Security Notes

- Files stored privately, outside public web root  
- Temporary download tokens expire (default: 1 hour)  
- Tokens are single-use with configurable max attempts  
- Lightning payments verified via BTCPay webhook  

---

## 🚀 Upgrade Path

- Paid seller plans: multiple products, larger file sizes  
- Seller-hosted files: generate presigned URLs from S3 or other storage  
- Analytics/dashboard enhancements  
- Optional ads or marketplace donations  

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend / Backend | Nuxt 4 (server routes) |
| Database | SQLite / PostgreSQL + Prisma |
| Payments | BTCPay Server (Lightning) |
| Storage | VPS-hosted (free plan) or S3-compatible (upgrade) |
| Download System | Temporary download tokens |

---

## 📝 Notes

- MVP is **Bitcoin-only**: prices are in sats, Lightning network recommended  
- Marketplace-hosted files for free sellers simplifies trust and storage  
- Secure delivery via temporary tokens ensures paid access  
- Product price is per-product; a default may be used if missing

---

## BTCPay Integration Reference

This section documents how the app integrates with BTCPay Server to create invoices, verify webhooks, and issue secure download tokens after payment. Keep your real credentials in `.env`.

### Environment variables (.env)

```dotenv
# BTCPay Server
BTCPAY_URL="https://your-btcpay.example.com"
BTCPAY_API_KEY="your_btcpay_api_key"
BTCPAY_STORE_ID="your_store_id"
BTCPAY_WEBHOOK_SECRET="your_webhook_secret"

# Files
UPLOAD_PATH="/home/marketplace/uploads"
TOKEN_EXPIRY=3600
```

### Server utility: `server/utils/btcpay.ts`

```ts
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
  const body = {
    amount: Number(satsToBtc(input.amountSats)),
    currency: 'BTC',
    metadata: {
      orderId: input.orderId,
      productId: input.productId,
      buyerEmail: input.buyerEmail ?? null
    },
    checkout: input.redirectURL
      ? { redirectURL: input.redirectURL, redirectAutomatically: true }
      : undefined
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

// Verify BTCPay webhook signature (header "BTCPay-Sig": sha256=<hex>)
export function verifyWebhookSignature(rawBody: string, sigHeader?: string | null) {
  const secret = process.env.BTCPAY_WEBHOOK_SECRET
  if (!secret) return false
  if (!sigHeader) return false

  const presented = sigHeader.replace(/^sha256=/i, '').trim()
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(presented), Buffer.from(hmac))
}
```

### Create invoice endpoint: `server/api/payments/btcpay.post.ts`

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId: string; amountSats?: number; orderId?: string; buyerEmail?: string }>(event)
  if (!body?.productId) {
    throw createError({ statusCode: 400, statusMessage: 'productId required' })
  }

  // In production, fetch price from DB using productId
  const amountSats = body.amountSats ?? 10_000
  const orderId = body.orderId ?? `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const origin = getRequestHeader(event, 'origin') || `${getRequestProtocol(event)}://${getRequestHost(event)}`
  const redirectURL = `${origin}/products/${body.productId}?paid=1`

  const { createInvoice } = await import('~/server/utils/btcpay')
  const invoice = await createInvoice({
    amountSats,
    orderId,
    productId: body.productId,
    buyerEmail: body.buyerEmail,
    redirectURL
  })

  // Persist a pending order with invoice.id (DB)
  return {
    invoiceId: invoice.id,
    checkoutUrl: invoice.checkoutLink,
    status: 'new',
    orderId
  }
})
```

### Webhook endpoint: `server/api/webhooks/btcpay.post.ts`

```ts
export default defineEventHandler(async (event) => {
  const sig = getHeader(event, 'btcpay-sig') || getHeader(event, 'BTCPay-Sig') || getHeader(event, 'btcpay-signature') || null
  const raw = (await readRawBody(event, 'utf8')) || ''
  const { verifyWebhookSignature } = await import('~/server/utils/btcpay')

  if (!verifyWebhookSignature(raw, sig)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid signature' })
  }

  const payload = JSON.parse(raw)
  const type = payload?.type || payload?.event || ''
  const data = payload?.data || payload

  const invoiceId: string | undefined = data?.id || data?.invoiceId
  const status: string | undefined = data?.status || data?.invoiceStatus
  const orderId: string | undefined = data?.metadata?.orderId || data?.orderId
  const productId: string | undefined = data?.metadata?.productId || data?.productId

  const settled = type === 'InvoiceSettled' || status?.toLowerCase() === 'settled' || status?.toLowerCase() === 'paid'

  if (settled && orderId && productId) {
    const { issueDownloadToken } = await import('~/server/utils/downloadTokens')
    const token = await issueDownloadToken({ orderId, productId })
    // Mark order as paid and attach token (DB)
  }

  return { ok: true }
})
```

### Download token utility: `server/utils/downloadTokens.ts`

```ts
import crypto from 'node:crypto'

type IssueTokenInput = {
  orderId: string
  productId: string
  filePath?: string
}

export type DownloadToken = {
  token: string
  filePath: string
  expiresAt: Date
  used: boolean
  orderId: string
  productId: string
}

export async function issueDownloadToken(input: IssueTokenInput): Promise<DownloadToken> {
  const ttlSec = Number(process.env.TOKEN_EXPIRY ?? 3600)
  const token = crypto.randomBytes(24).toString('hex')
  const filePath = input.filePath ?? `/secure/path/for/${input.productId}`

  const record: DownloadToken = {
    token,
    filePath,
    expiresAt: new Date(Date.now() + ttlSec * 1000),
    used: false,
    orderId: input.orderId,
    productId: input.productId
  }

  // Persist token to DB in production
  return record
}
```

### Seller upload endpoint (secure): `server/api/seller/upload.post.ts`

```ts
import { promises as fsp } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'multipart form-data required' })

  let filePart: any
  let productId = ''
  let sellerId = ''
  for (const p of form) {
    if (p.name === 'file') filePart = p
    if (p.name === 'productId' && typeof p.data === 'string') productId = p.data
    if (p.name === 'sellerId' && typeof p.data === 'string') sellerId = p.data
  }

  if (!filePart || !productId || !sellerId) {
    throw createError({ statusCode: 400, statusMessage: 'file, productId, sellerId required' })
  }

  const base = process.env.UPLOAD_PATH
  if (!base) throw createError({ statusCode: 500, statusMessage: 'UPLOAD_PATH not set' })

  const dir = path.resolve(base, sellerId, productId)
  await fsp.mkdir(dir, { recursive: true })
  const dest = path.resolve(dir, filePart.filename)

  await fsp.writeFile(dest, filePart.data)

  // Save file path for product in DB in production
  return { ok: true, path: dest }
})
```

### Frontend usage (create invoice and redirect)

```ts
const { generateInvoice } = useApi()
const buy = async () => {
  const res = await generateInvoice(productId)
  window.location.href = res.checkoutUrl
}
```

### Configure BTCPay webhook

- Create a webhook in your BTCPay Store to `https://your-app.example.com/api/webhooks/btcpay`.
- Set the secret to the same value as `BTCPAY_WEBHOOK_SECRET`.
- Ensure events for invoice payments are enabled (e.g., InvoiceSettled).
- The webhook will verify HMAC and issue a download token on payment.
