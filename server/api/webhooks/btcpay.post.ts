export default defineEventHandler(async (event) => {
  // TODO: Verify BTCPay webhook signature and status
  const payload = await readBody<any>(event)

  // Placeholder: return ok to BTCPay
  return { ok: true, received: !!payload }
})


