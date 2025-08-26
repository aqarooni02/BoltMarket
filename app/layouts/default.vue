<script setup lang="ts">
const mobileOpen = ref(false)
const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Sell', to: '/seller', primary: true }
]
</script>

<template>
  <div class="min-h-dvh flex flex-col relative">
  <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 dark:from-primary/15 via-transparent to-transparent" />

    <header class="border-b">
      <UContainer class="h-14 flex items-center justify-between gap-4 relative">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-zap" class="text-primary" />
          <span class="font-semibold">BoltMarket</span>
        </div>

        <nav class="hidden md:flex items-center gap-1.5">
          <UButton
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            size="sm"
            :color="l.primary ? 'primary' : 'neutral'"
            :variant="l.primary ? 'solid' : 'ghost'"
            class="tracking-tight"
          >
            {{ l.label }}
          </UButton>
          <ColorModeButton />
        </nav>

        <div class="md:hidden">
            <ColorModeButton />
          <UButton color="neutral" variant="ghost" @click="mobileOpen = !mobileOpen" aria-label="Toggle navigation">
            <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" />
          </UButton>
        </div>

        <div v-if="mobileOpen" class="absolute left-0 right-0 top-full z-20 border-b bg-white/95 dark:bg-zinc-900/95 backdrop-blur md:hidden">
          <div class="p-3 flex flex-col gap-2">
            <UButton v-for="l in links" :key="l.to" :to="l.to" block size="md" :color="l.primary ? 'primary' : 'neutral'" :variant="l.primary ? 'solid' : 'ghost'" @click="mobileOpen = false">
              {{ l.label }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </header>

    <main class="flex-1">
      <UContainer>
        <slot />
      </UContainer>
    </main>

    <footer class="border-t">
      <UContainer class="h-12 flex items-center">
        <div class="text-sm text-gray-500">All items sold for 10k sats</div>
      </UContainer>
    </footer>
  </div>
</template>


