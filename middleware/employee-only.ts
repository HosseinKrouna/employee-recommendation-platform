export default defineNuxtRouteMiddleware((to, from) => {
  const { data } = useAuth()
  
  const authData = data.value as { user: { department: string | null } | null }
  const department = authData?.user?.department
  
  // Redirect HR to their dashboard
  if (department === 'HR' || department === 'Human Resources') {
    return navigateTo('/hr/dashboard')
  }
})