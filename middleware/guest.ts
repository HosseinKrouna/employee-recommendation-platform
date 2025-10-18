export default defineNuxtRouteMiddleware((to, from) => {
  const { status } = useAuth()
  
  // Wenn User eingeloggt ist, weiterleiten zum Dashboard
  if (status.value === 'authenticated') {
    return navigateTo('/dashboard')
  }
})