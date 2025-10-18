export default defineNuxtRouteMiddleware((to) => {
  const { status, data } = useAuth()
  
  if (status.value === 'unauthenticated') {
    return navigateTo('/login')
  }
  
  const user = data.value?.user as any
  if (user && user.role !== 'HR' && user.role !== 'ADMIN') {
    return navigateTo('/dashboard')
  }
})