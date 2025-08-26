# Bitcoin Marketplace - Full Project Spec & Overview

## Project Overview

A Bitcoin-only digital marketplace for digital goods. Buyers pay in Lightning or on-chain BTC, sellers upload or host files, and the marketplace handles payment processing, delivery, secure downloads, and seller withdrawals.

## Tech Stack

- **Frontend / Backend:** Nuxt 4 (server routes for API)  
- **Database:** PostgreSQL or SQLite via Prisma ORM  
- **Payment Processor:** BTCPay Server (Lightning invoices)  
- **File Storage:** Marketplace-hosted for free plan; optional S3-compatible storage  
- **Delivery:** Temporary download links (time-limited, one-time access)  

## Features (MVP)

### Seller
- Register/login, create products  
- Upload digital products (max 100 MB for free plan)  
- View sales, earnings, and download stats  
- Withdraw funds once balance ≥ $10 (in sats)  
- Marketplace takes 5% fee per sale automatically  

### Buyer
- Browse marketplace listings  
- Pay in Bitcoin via Lightning invoice  
- Receive secure, temporary download link after payment  

### Marketplace
- Generate Lightning invoices via BTCPay API  
- Validate payment using webhook  
- Deduct 5% marketplace fee and credit seller balance  
- Issue temporary download token after payment  

## MVP Flow

### Buying a Product
1. Buyer clicks **Buy**  
2. Nuxt API calls BTCPay to generate invoice  
3. Buyer pays invoice → BTCPay webhook triggers  
4. Marketplace verifies payment & HMAC signature  
5. Deduct 5% marketplace fee  
6. Credit remaining sats to seller balance  
7. Generate temporary download token  
8. Buyer downloads product via `/download/{token}`  
9. Token expires automatically (time-limited & one-time use)  

### Seller Withdrawals
1. Seller requests withdrawal  
2. System checks `balance_sats >= MIN_WITHDRAW_SATS` (≈ $10)  
3. Funds sent to seller wallet  
4. Balance updated  

## Security Notes
- Files stored privately, outside public web root  
- Download tokens expire after `TOKEN_EXPIRY` and are one-time use  
- Lightning payments verified via webhook  
- Sellers only withdraw when minimum balance is met  

## Upgrade Path
- Paid seller plans: multiple products, larger files  
- Seller-hosted files (S3 presigned URLs)  
- Analytics/dashboard, optional donations or ads  

## Frontend Usage Example

```ts
const { generateInvoice } = useApi()
const buy = async () => {
  const res = await generateInvoice(productId)
  window.location.href = res.checkoutUrl
}
