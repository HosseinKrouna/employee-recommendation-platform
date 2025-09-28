<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        Employee Recommendation Platform
      </h1>
      
      <div class="space-y-4">
        <UButton @click="navigateTo('/auth/login')" size="lg" block>
          Zur Anmeldung
        </UButton>
        
        <UButton @click="navigateTo('/dashboard')" variant="outline" size="lg" block>
          Zum Dashboard
        </UButton>
      </div>
      
      <div class="mt-8 p-4 bg-gray-100 rounded-lg">
        <p class="text-sm text-gray-600">Debug:</p>
        <button @click="testAuthStatus" class="text-xs bg-blue-100 px-2 py-1 rounded mt-2">
          Auth Status testen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const testAuthStatus = () => {
  const { status, data } = useAuth()
  console.log('Current status:', status.value)
  console.log('Current user:', data.value.user)
}
</script>