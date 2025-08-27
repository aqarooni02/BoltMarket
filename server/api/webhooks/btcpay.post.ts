export default defineEventHandler(async (event) => {
  console.log('BTCPay webhook received')
  const sig =
    getRequestHeader(event, 'btcpay-sig') ||
    getRequestHeader(event, 'BTCPay-Sig') ||
    getRequestHeader(event, 'btcpay-signature') ||
    null

  const raw = (await readRawBody(event, 'utf8')) || ''
  const { verifyWebhookSignature } = await import('../../utils/btcpay')

  if (!verifyWebhookSignature(String(raw), sig)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid signature' })
  }

  let payload: any = {}
  try {
    payload = raw ? JSON.parse(String(raw)) : {}
  } catch {
    // ignore, payload stays empty
  }
  console.log(payload)
  // Minimal handling (no DB): acknowledge only
  // You can extend here to issue a download token, etc.
  return { ok: true }
})


