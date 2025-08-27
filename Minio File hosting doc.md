
# 📦 File Hosting with MinIO (Nuxt 4 + BTCPayServer)

This service powers digital product delivery for the marketplace.  
It uses **self-hosted MinIO** (S3-compatible storage) to store seller uploads securely and generate expiring download links for buyers.  

> ⚠️ **Note:** Free-tier sellers have lower limits. Premium sellers can upgrade for larger uploads and more downloads.

---

## 🚀 Architecture

```
Nuxt 4 App (frontend + server API)
        │
        ├─ Upload route (/api/seller/upload)
        │     ↳ Stores file (MVP: local ${UPLOAD_PATH}/{sellerId}/{productId})
        │     ↳ (Upgrade) MinIO: <seller-bucket>-quarantine → validation → -products
        │
        ├─ BTCPay Webhook (/api/webhooks/btcpay)
        │     ↳ Verifies signature, confirms invoice
        │     ↳ Deducts fee, credits seller balance, issues download token
        │
        └─ Download route (/api/download/:token)
              ↳ Validates token
              ↳ (Local) streams file / (MinIO) redirects to signed URL
```

---

## 🛡️ Protection Pipeline

### Upload Validation
- **File size (MVP defaults):** Free Tier: max 100 MB upload (configurable via `FILE_MAX_MB`).  
- **Archive checks (ZIP)**:
  - Reject if encrypted/password-protected.  
  - Reject if path traversal (`../`, absolute paths).  
  - Reject executables (`.exe, .dll, .bat, .js, .jar, .apk`, etc).  
  - Reject nested archives.  
  - Max 10k files, 10 directory depth, filename length ≤ 255 chars.  
  - Compression ratio ≤ 20 (anti-zip bomb).  
- **Antivirus scan:** ClamAV scan on extracted content.  
- **Hashing:** SHA-256 per file and full archive.  
- **Manifest:** store file list, sizes, hashes for auditing.  

### Storage Security
- **MinIO with server-side encryption** (SSE-KMS).  
- One bucket per seller: `<seller-id>-quarantine`, `<seller-id>-products`.  
- All objects private by default; only accessed via signed URLs.  

### Delivery
- **Tokens:** default 1-hour expiry (`TOKEN_EXPIRY`), single-use with `DOWNLOAD_MAX_ATTEMPTS=1` (configurable).  
- **Download limits:** configurable attempts per purchase.  
- **Audit log:** IP, timestamp, user ID.  
- (Optional) **Watermarking:** inject buyer info into LICENSE.txt before delivery.  

---

## 🛠️ Setup MinIO

Run MinIO locally or on your server:

```bash
docker run -d   -p 9000:9000 -p 9001:9001   -v ~/minio-data:/data   -e "MINIO_ROOT_USER=admin"   -e "MINIO_ROOT_PASSWORD=secretpass"   quay.io/minio/minio server /data --console-address ":9001"
```

Create buckets (per seller):

```bash
mc alias set local http://localhost:9000 admin secretpass
mc mb local/seller123-quarantine
mc mb local/seller123-products
```

---

## 📑 Nuxt 4 API Examples

### 1. Upload (Seller)
\`/server/api/seller/upload.post.ts\`

```ts
import formidable from "formidable";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { validateZip } from "~/server/utils/validateZip"; // implement checks

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_KEY!,
    secretAccessKey: process.env.MINIO_SECRET!
  },
  forcePathStyle: true
});

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: false });
  const [fields, files] = await form.parse(event.node.req);

  const file = files.file[0];
  await validateZip(file.filepath);

  const stream = fs.createReadStream(file.filepath);
  await s3.send(new PutObjectCommand({
    Bucket: `${fields.sellerId}-quarantine`,
    Key: file.originalFilename,
    Body: stream
  }));

  return { success: true };
});
```

---

### 2. Payment Webhook (BTCPay)
\`/server/api/webhooks/btcpay.post.ts\`

```ts
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ /* same config */ });

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (body.status !== "paid") return { ok: false };

  const src = `${body.sellerId}-quarantine/${body.productKey}`;
  const dest = `${body.sellerId}-products/${body.productId}.zip`;

  await s3.send(new CopyObjectCommand({
    Bucket: `${body.sellerId}-products`,
    CopySource: `/${body.sellerId}-quarantine/${body.productKey}`,
    Key: dest
  }));

  await s3.send(new DeleteObjectCommand({
    Bucket: `${body.sellerId}-quarantine`,
    Key: body.productKey
  }));

  return { ok: true };
});
```

---

### 3. Generate Signed Download Link
\`/server/api/download/[token].get.ts\`

```ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ /* same config */ });

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  // validate token in DB (expiry, attempts left, productId)
  const productKey = "seller123-products/my-product.zip"; // lookup via token

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: "seller123-products", Key: productKey }),
    { expiresIn: 3600 }
  );

  return { url };
});
```

---

## 🔒 Environment Variables
\`\`\`env
# Optional MinIO (upgrade path)
MINIO_KEY=admin
MINIO_SECRET=secretpass
MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1

# MVP local storage
STORAGE_DRIVER=local
UPLOAD_PATH=./uploads

# Tokens & policy
TOKEN_EXPIRY=3600
DOWNLOAD_MAX_ATTEMPTS=1
MARKETPLACE_FEE_PERCENT=5
MIN_WITHDRAW_SATS=50000
\`\`\`

---

## ✅ Summary
- **MVP:** Local filesystem under `${UPLOAD_PATH}`; MinIO as upgrade behind a driver.  
- **MinIO path:** one bucket per seller (`<seller-id>-quarantine`, `<seller-id>-products`) when enabled.  
- **Flow:** Upload → (optional) quarantine/validation → promote → issue download token after BTCPay payment.  
- **Protection:** file checks, antivirus option, signed URLs or streaming, audit logging.  
- **Tiers:** Free sellers have lower limits; premium sellers can upgrade for larger sizes and more attempts.
