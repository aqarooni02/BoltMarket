
# Bitcoin-Only Digital Marketplace (MVP)

A lightweight marketplace for digital products where buyers pay in Bitcoin (sats) and sellers host or upload their files. The platform handles **Lightning payments** and **secure temporary downloads** for purchased products.

---

## 🏗 Architecture Overview

**Frontend / Backend:** Nuxt 4 (server routes for API)  
**Database:** SQLite/PostgreSQL via Prisma ORM  
**Payment Processor:** BTCPay Server (Lightning invoices)  
**File Storage:** Marketplace-hosted for free plan; seller-hosted optional for upgrades  
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
| sellers | id, username, wallet_address, plan_type |
| products | id, seller_id, title, description, sats_price, file_path |
| orders | id, product_id, buyer_info, invoice_id, status |
| download_tokens | token, file_path, expires_at, used |

---

## ⚙️ MVP Flow

1. Seller registers → adds a product → uploads file  
2. Product goes live → visible in marketplace  
3. Buyer clicks **Buy** → Lightning invoice is generated  
4. Buyer pays → BTCPay webhook confirms payment  
5. Marketplace generates **temporary download token**  
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
```dotenv
DATABASE_URL="postgresql://user:pass@localhost:5432/marketplace"
BTCPAY_API_KEY="your_btcpay_api_key"
BTCPAY_STORE_ID="your_store_id"
UPLOAD_PATH="/home/marketplace/uploads"
TOKEN_EXPIRY=3600 # in seconds
```

4. Run database migrations (Prisma):  
```bash
npx prisma migrate dev --name init
```

5. Start development server:  
```bash
npm run dev
```

6. Upload files in `/uploads/{seller_id}/{product_id}` for free plan products.

---

## 🔐 Security Notes

- Files stored privately, outside public web root  
- Temporary download tokens expire (default: 1 hour)  
- Tokens can be limited to one-time download  
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

- MVP is **Bitcoin-only**: all prices in sats, Lightning network recommended  
- Marketplace-hosted files for free sellers simplifies trust and storage  
- Secure delivery via temporary tokens ensures paid access  
- All items are sold for 10k sats
