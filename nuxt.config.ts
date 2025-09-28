import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    typeCheck: false
  },

  // TypeScript temporär komplett deaktiviert
  ssr: true,
  nitro: {
    typescript: {
      generateTsConfig: false
    }
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    
    public: {
      appName: 'Employee Recommendation Platform',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
})