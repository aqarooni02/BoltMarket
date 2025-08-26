export function useApi() {
  const generateInvoice = async (productId: string) => {
    const res = await $fetch('/api/payments/btcpay', {
      method: 'POST',
      body: { productId }
    })
    return res as { invoiceId: string; checkoutUrl: string; status: string }
  }

  return { generateInvoice }
}


