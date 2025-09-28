<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h1>Auth Test</h1>
      <p>Status: {{ status }}</p>
      <p>User: {{ data.user?.name || 'Nicht eingeloggt' }}</p>
      <button @click="testLogin" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Test Login
      </button>
    </div>
  </div>
</template>

<script setup>
const { status, data, signIn } = useAuth()

const testLogin = async () => {
  const result = await signIn({
    email: 'employee@testcompany.com',
    password: 'TestPass123!'
  })
  console.log('Login result:', result)
}

console.log('Initial status:', status.value)
</script>