<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { generateInvoice } = useApi()

const product = computed(() => ({
  id: String(route.params.id || ''),
  title: 'Sample Product',
  price: 10000,
  description: 'Digital product description placeholder.'
}))

const loading = ref(false)
const errorMsg = ref('')

async function buy() {
  try {
    loading.value = true
    errorMsg.value = ''
    const res = await generateInvoice(product.value.id)
    if (res?.checkoutUrl) {
      window.location.href = res.checkoutUrl
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (err: any) {
    errorMsg.value = err?.message || 'Failed to create invoice'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{{ product.title }}</h1>
      <UBadge color="warning" variant="subtle">{{ product.price.toLocaleString() }} sats</UBadge>
    </div>
    <p class="text-gray-600">{{ product.description }}</p>
    <div class="flex items-center gap-3">
      <UButton :loading="loading" color="primary" @click="buy">Buy</UButton>
      <span v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</span>
    </div>
  </div>
  
</template>


