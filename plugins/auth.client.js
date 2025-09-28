export default defineNuxtPlugin(async () => {
  console.log('Auth plugin starting...')
  
  const { fetchUser, data, status } = useAuth()
  
  console.log('Initial auth state:', {
    user: data.value.user,
    status: status.value
  })
  

  if (localStorage.getItem('user')) {
    console.log('Found user in localStorage:', JSON.parse(localStorage.getItem('user')))
  } else {
    console.log('No user in localStorage')
  }
  
  try {
    console.log('Calling fetchUser...')
    await fetchUser()
    console.log('After fetchUser - User:', data.value.user)
    console.log('After fetchUser - Status:', status.value)
  } catch (error) {
    console.error('Plugin fetchUser error:', error)
  }
})