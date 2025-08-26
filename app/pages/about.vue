<template>
  <div class="py-10 space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">About</h1>
      <p class="text-neutral-600 dark:text-neutral-400 max-w-2xl">A Bitcoin-only marketplace for digital goods. Buyers pay Lightning invoices, and receive secure, temporary download links. Sellers can list and upload files simply.</p>
    </div>

    <UCard>
      <template #header>
        <div class="font-semibold">How it works</div>
      </template>
      <ol class="list-decimal pl-6 space-y-1 text-neutral-700 dark:text-neutral-300">
        <li>Seller lists a product and uploads a file</li>
        <li>Buyer clicks Buy and pays via Lightning</li>
        <li>Payment is confirmed by webhook</li>
        <li>A temporary download token is issued</li>
      </ol>
    </UCard>
  </div>
</template>


