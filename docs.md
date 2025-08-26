# Bitcoin Marketplace - Technical Documentation & API Reference

## Environment Variables (.env)

```dotenv
# BTCPay Server
BTCPAY_URL="https://your-btcpay.example.com"
BTCPAY_API_KEY="your_btcpay_api_key"
BTCPAY_STORE_ID="your_store_id"
BTCPAY_WEBHOOK_SECRET="your_webhook_secret"

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/marketplace"

# Files
UPLOAD_PATH="/home/marketplace/uploads"
TOKEN_EXPIRY=3600 # seconds

# Marketplace
MIN_WITHDRAW_USD=10
MARKETPLACE_FEE_PERCENT=5
```

## Server Utilities

* **server/utils/btcpay.ts** → Create invoices, verify BTCPay webhook signatures
* **server/utils/downloadTokens.ts** → Generate temporary download tokens
* **server/utils/conversions.ts** → Convert USD → sats for minimum withdrawal

## API Endpoints

### Payments

**POST /api/payments/btcpay**

* Input: `{ productId, amountSats?, orderId?, buyerEmail? }`
* Returns: `{ invoiceId, checkoutUrl, orderId }`
* Creates Lightning invoice, persists pending order

### Webhooks

**POST /api/webhooks/btcpay**

* Verifies signature
* Confirms invoice paid
* Deduct 5% marketplace fee
* Credit seller balance
* Issues download token

### Seller Upload

**POST /api/seller/upload**

* Accepts multipart file upload
* Stores files in `/uploads/{sellerId}/{productId}`
* Saves file path in DB

### Withdrawals

**POST /api/seller/withdraw**

* Checks seller balance ≥ `MIN_WITHDRAW_USD`
* Sends funds to seller wallet
* Updates balance and withdrawal record

## Recommended Database Schema (Prisma)

```prisma
model Seller {
  id             String   @id @default(cuid())
  username       String   @unique
  email          String   @unique
  wallet_address String?
  plan_type      String   @default("free")
  balance_sats   BigInt   @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  products       Product[]
  withdrawals    Withdrawal[]
}

model Product {
  id          String   @id @default(cuid())
  seller      Seller   @relation(fields: [sellerId], references: [id])
  sellerId    String
  title       String
  description String?
  sats_price  BigInt
  file_path   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
}

model Order {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  buyerInfo String?
  invoiceId String   @unique
  status    String   @default("pending")
  satsPaid  BigInt?
  feeSats   BigInt?  // 5% marketplace fee
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  downloadTokens DownloadToken[]
}

model DownloadToken {
  token      String   @id @default(cuid())
  order      Order    @relation(fields: [orderId], references: [id])
  orderId    String
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  filePath   String
  expiresAt  DateTime
  used       Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Withdrawal {
  id        String   @id @default(cuid())
  seller    Seller   @relation(fields: [sellerId], references: [id])
  sellerId  String
  sats      BigInt
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Notes

* This schema supports marketplace fees, minimum withdrawal balance, and secure delivery of digital goods.
* All payouts, invoices, and download tokens are tracked for reliability and security.


