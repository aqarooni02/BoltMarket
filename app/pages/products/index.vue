<script setup lang="ts">
const q = ref('')
const base = [
  { id: '1', title: 'Ebook: Learn Lightning', price: 10000, description: 'Beginner guide to Lightning.' },
  { id: '2', title: 'Icon Pack', price: 10000, description: 'Minimal crypto icons.' },
  { id: '3', title: 'Trading Bot Config', price: 10000, description: 'Profit settings.' }
]
const products = computed(() => base.filter(p => p.title.toLowerCase().includes(q.value.toLowerCase())))
</script>

<template>
  <div class="space-y-6 py-8">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h1 class="text-2xl font-semibold">Products</h1>
      <UInput v-model="q" placeholder="Search products..." icon="i-lucide-search" class="w-full sm:w-72" />
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="p in products" :key="p.id">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-medium">{{ p.title }}</div>
            <UBadge color="warning" variant="subtle">{{ p.price.toLocaleString() }} sats</UBadge>
          </div>
        </template>
        <p class="text-gray-600">{{ p.description }}</p>
        <template #footer>
          <div class="flex justify-end">
            <UButton :to="`/products/${p.id}`" color="primary">View</UButton>
          </div>
        </template>
      </UCard>
    </div>
    <UAlert v-if="products.length === 0" icon="i-lucide-info" color="neutral" title="No products found" description="Try a different search term." />
  </div>
</template>


