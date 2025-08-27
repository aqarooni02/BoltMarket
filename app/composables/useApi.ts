export function useApi() {
  const generateInvoice = async (productId: string, amountSats?: number, buyerEmail?: string) => {
    const res = await $fetch('/api/payments/btcpay', {
      method: 'POST',
      body: { productId, amountSats, buyerEmail }
    })
    return res as { invoiceId: string; checkoutUrl: string; status: string; orderId: string }
  }

  return { generateInvoice }
}


