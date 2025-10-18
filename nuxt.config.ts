import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui'
  ],
  
  app: {
    head: {
      htmlAttrs: {
        class: 'dark' 
      }
    }
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    typeCheck: false
  },
  
  routeRules: {
    '/api/upload/**': { 
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    
    emailFrom: process.env.EMAIL_FROM || 'noreply@company.com',
    emailFromName: process.env.EMAIL_FROM_NAME || 'Employee Recommendation Platform',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    
    public: {
      appName: 'Employee Recommendation Platform',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
})