export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId: string; amountSats?: number; orderId?: string; buyerEmail?: string }>(event)
  if (!body?.productId) {
    throw createError({ statusCode: 400, statusMessage: 'productId required' })
  }

  const amountSats = body.amountSats ?? 10_000
  const orderId = body.orderId ?? `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const origin = getRequestHeader(event, 'origin') || `${getRequestProtocol(event)}://${getRequestHost(event)}`
  const redirectURL = `${origin}/products/${body.productId}?paid=1`

  const { createInvoice } = await import('../../utils/btcpay')
  const invoice = await createInvoice({
    amountSats,
    orderId,
    productId: body.productId,
    buyerEmail: body.buyerEmail,
    redirectURL
  })

  return {
    invoiceId: invoice.id,
    checkoutUrl: invoice.checkoutLink,
    status: 'new',
    orderId
  }
})


