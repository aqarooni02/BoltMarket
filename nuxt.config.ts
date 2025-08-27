// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxtus/nuxt-localtunnel'
  ],
  runtimeConfig: {
    btcpayApiKey: process.env.BTCPAY_API_KEY,
    btcpayStoreId: process.env.BTCPAY_STORE_ID,
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    tokenExpiry: process.env.TOKEN_EXPIRY ? Number(process.env.TOKEN_EXPIRY) : 3600,
    public: {}
  },
  css: ['~/assets/main.css'],

})
