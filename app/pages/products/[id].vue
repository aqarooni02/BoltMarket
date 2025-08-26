<script setup lang="ts">
const route = useRoute()
const product = computed(() => ({
  id: String(route.params.id || ''),
  title: 'Sample Product',
  price: 10000,
  description: 'Digital product description placeholder.'
}))

const isOpen = ref(false)
</script>

<template>
  <div class="py-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{{ product.title }}</h1>
      <UBadge color="warning" variant="subtle">{{ product.price.toLocaleString() }} sats</UBadge>
    </div>
    <p class="text-gray-600">{{ product.description }}</p>
    <UButton color="primary" @click="isOpen = true">Buy for 10,000 sats</UButton>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="font-medium">Confirm Purchase</div>
        </template>
        <div class="space-y-3">
          <p>Proceed to generate a Lightning invoice via BTCPay.</p>
          <UAlert color="warning" title="Test Mode" description="This is a placeholder interaction." />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
            <UButton color="primary" @click="isOpen = false">Generate Invoice</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>


