
# 📦 File Hosting with MinIO (Nuxt + BTCPayServer)

This service powers digital product delivery for the marketplace.  
It uses **self-hosted MinIO** (S3-compatible storage) to store seller uploads securely and generate expiring download links for buyers.  

> ⚠️ **Note:** Free-tier sellers have lower limits. Premium sellers can upgrade for larger uploads and more downloads.

---

## 🚀 Architecture

```
Nuxt 3 App (frontend + server API)
        │
        ├─ Upload route (/api/upload)
        │     ↳ Stores file in MinIO <seller-bucket>-quarantine
        │     ↳ Runs validation + AV scanning
        │     ↳ Moves clean files to <seller-bucket>-products
        │
        ├─ BTCPay Webhook (/api/payment/paid)
        │     ↳ Confirms invoice
        │     ↳ Issues signed URL for buyer
        │
        └─ Download route (/api/download/:token)
              ↳ Validates token
              ↳ Redirects to signed MinIO URL (1h expiry, limited attempts)
```

---

## 🛡️ Protection Pipeline

### Upload Validation
- **File size:** max 2 GB upload, max 5 GB uncompressed (Free Tier: 500 MB upload, 2 GB uncompressed).  
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
- **Signed URLs:** 1-hour expiry, single use. (Free Tier: 30 min expiry, 1 download attempt)  
- **Download limits:** 3 attempts per purchase.  
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

## 📑 Nuxt 3 API Examples

### 1. Upload (Seller)
\`/server/api/upload.post.ts\`

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
\`/server/api/payment/paid.post.ts\`

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
MINIO_KEY=admin
MINIO_SECRET=secretpass
MINIO_ENDPOINT=http://localhost:9000
\`\`\`

---

## ✅ Summary
- **Buckets:** one per seller (`<seller-id>-quarantine`, `<seller-id>-products`).  
- **Upload → quarantine bucket → validation → promote to products bucket**.  
- **Protection:** file checks, antivirus, encryption, signed URLs, audit logging.  
- **Delivery:** expiring download links after BTCPay payment confirmation.  
- **Tiers:** Free sellers have lower limits, premium sellers can upgrade for larger file sizes and more download attempts.
