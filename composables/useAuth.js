import { ref, computed } from 'vue'
import { navigateTo } from '#app'

export const useAuth = () => {
  const authState = ref({
    user: null,
    loading: true
  })

  const signIn = async (credentials) => {
    try {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      if (data?.user) {
        authState.value.user = data.user
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
      authState.value.user = null
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchUser = async () => {
    try {
      authState.value.loading = true
      const data = await $fetch('/api/auth/me')
      authState.value.user = data.user
    } catch (error) {
      authState.value.user = null
    } finally {
      authState.value.loading = false
    }
  }

  const status = computed(() => {
    if (authState.value.loading) return 'loading'
    return authState.value.user ? 'authenticated' : 'unauthenticated'
  })

  const data = computed(() => ({
    user: authState.value.user
  }))

  return {
    data,
    status,
    signIn,
    signOut,
    fetchUser
  }
}