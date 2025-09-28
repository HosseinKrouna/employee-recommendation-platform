import { ref, computed } from 'vue'
import { navigateTo } from '#app'

const globalAuthState = ref({
  user: null,
  loading: true
})

export const useAuth = () => {
  const signIn = async (credentials) => {
    try {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      if (data?.user) {
        globalAuthState.value.user = data.user
        globalAuthState.value.loading = false
        
        if (import.meta.client) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      }
      
      return { error: null }
    } catch (error) {
      return { 
        error: error.data?.statusMessage || 'Login fehlgeschlagen' 
      }
    }
  }

  const signOut = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      globalAuthState.value.user = null
      globalAuthState.value.loading = false
      
      if (import.meta.client) {
        localStorage.removeItem('user')
      }
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchUser = async () => {
    try {
      globalAuthState.value.loading = true
      
      const data = await $fetch('/api/auth/me')
      globalAuthState.value.user = data.user
      
      if (import.meta.client) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (error) {
      console.log('Cookie auth failed, trying localStorage...')
      
      if (import.meta.client) {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            globalAuthState.value.user = user
            console.log('Loaded user from localStorage:', user.name)
          } catch (e) {
            localStorage.removeItem('user')
            globalAuthState.value.user = null
          }
        } else {
          globalAuthState.value.user = null
        }
      }
    } finally {
      globalAuthState.value.loading = false
      console.log('Final auth state:', {
        user: globalAuthState.value.user?.name || 'null',
        loading: globalAuthState.value.loading
      })
    }
  }

  const status = computed(() => {
    if (globalAuthState.value.loading) return 'loading'
    return globalAuthState.value.user ? 'authenticated' : 'unauthenticated'
  })

  const data = computed(() => ({
    user: globalAuthState.value.user
  }))

  return {
    data,
    status,
    signIn,
    signOut,
    fetchUser
  }
}