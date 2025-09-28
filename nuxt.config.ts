import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui'

  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
   
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    
    public: {
      appName: 'Employee Recommendation Platform',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },

  typescript: {
    typeCheck: false
  }
})