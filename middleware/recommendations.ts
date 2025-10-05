export default defineNuxtRouteMiddleware((to) => {
  const { status, data } = useAuth()
  
  // Nicht authentifiziert -> Login
  if (status.value === 'unauthenticated') {
    return navigateTo('/auth/login')
  }
  
  // HR darf keine Empfehlungen erstellen
  const user = data.value?.user as any
  if (to.path === '/recommendations/create' && user?.role === 'HR') {
    return navigateTo('/dashboard')
  }
})