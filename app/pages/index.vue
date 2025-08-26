<script setup lang="ts">
const features = [
  { icon: 'i-lucide-zap', title: 'Lightning Payments', description: 'Pay in sats via BTCPay Server.' },
  { icon: 'i-lucide-shield-check', title: 'Secure Downloads', description: 'Temporary, one-time links.' },
  { icon: 'i-lucide-upload', title: 'Seller Uploads', description: 'Host files up to 100 MB.' }
]
</script>

<template>
  <section class="py-16 relative overflow-hidden">
    <div class="text-center space-y-5">
      <div class="flex items-center justify-center gap-2">
        <UBadge color="primary" variant="subtle" class="uppercase tracking-widest text-primary-foreground/80">Bitcoin Only</UBadge>
        <UBadge color="neutral" variant="subtle" class="uppercase tracking-widest text-neutral-900 dark:text-neutral-100">10k sats</UBadge>
      </div>
      <h1 class="text-5xl font-extrabold tracking-tight">BoltMarket</h1>
      <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">Lightning-fast marketplace for digital goods. Pay with sats, receive secure one-time downloads.</p>
      <div class="flex items-center justify-center gap-3">
        <UButton color="primary" size="lg" to="/products" class="px-6">Browse Products</UButton>
        <UButton variant="outline" size="lg" color="neutral" to="/seller" class="px-6">Start Selling</UButton>
      </div>
    </div>
  </section>

  <section class="pb-12">
    <div class="grid gap-4 sm:grid-cols-3">
      <UCard v-for="f in features" :key="f.title">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon :name="f.icon" class="text-primary" />
            <h3 class="font-semibold">{{ f.title }}</h3>
          </div>
        </template>
        <p class="text-neutral-600 dark:text-neutral-400">{{ f.description }}</p>
      </UCard>
    </div>
  </section>
</template>


