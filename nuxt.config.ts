import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@sidebase/nuxt-auth'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
   
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    authSecret: process.env.NEXTAUTH_SECRET,
    
  
    public: {
      appName: 'Employee Recommendation Platform',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      authUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }
  },

  typescript: {
    typeCheck: false
  },

  // auth: {
  //   baseURL: process.env.NEXTAUTH_URL,
  //   provider: {
  //     type: 'authjs'
  //   }
  // }
})