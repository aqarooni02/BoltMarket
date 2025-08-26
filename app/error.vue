<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="py-16 space-y-6">
    <UCard>
      <template #header>
        <div class="font-semibold">Error {{ props.error.statusCode || '' }}</div>
      </template>
      <p class="text-gray-600">{{ props.error.message || 'Something went wrong.' }}</p>
      <template #footer>
        <UButton color="primary" @click="handleError">Go Home</UButton>
      </template>
    </UCard>
</div>
  
</template>


