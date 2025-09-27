import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    typeCheck: false
  }
})