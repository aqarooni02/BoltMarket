<script setup lang="ts">
const form = reactive({
  title: '',
  description: '',
  file: null as File | null,
  price: 10000
})

function submit() {
  // Placeholder: would upload and create product
  alert('Submitted (placeholder)')
}
</script>

<template>
  <div class="py-8 space-y-6">
    <h1 class="text-2xl font-semibold">Sell a Product</h1>

    <UCard>
      <UForm :state="form" class="space-y-4" @submit.prevent="submit">
        <UFormGroup label="Title">
          <UInput v-model="form.title" placeholder="Product title" />
        </UFormGroup>
        <UFormGroup label="Description">
          <UTextarea v-model="form.description" placeholder="Short description" />
        </UFormGroup>
        <UFormGroup label="Price (sats)">
          <UInput v-model.number="form.price" type="number" min="1" />
        </UFormGroup>
        <UFormGroup label="File">
          <UInput type="file" @change="(e: any) => form.file = e?.target?.files?.[0] || null" />
        </UFormGroup>
        <div class="flex justify-end">
          <UButton color="primary" type="submit">Save</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>


