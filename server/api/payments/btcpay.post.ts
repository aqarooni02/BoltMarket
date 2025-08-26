export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId: string }>(event)
  if (!body?.productId) {
    throw createError({ statusCode: 400, statusMessage: 'productId required' })
  }

  // TODO: Integrate BTCPay Server invoice generation
  // Placeholder response structure
  return {
    invoiceId: 'inv_test_123',
    checkoutUrl: 'https://btcpay.example.com/i/inv_test_123',
    status: 'new'
  }
})


