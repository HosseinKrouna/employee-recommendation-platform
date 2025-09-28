<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          Employee Recommendation Platform
        </h2>
        <p class="mt-2 text-gray-600">
          Melde dich an, um fortzufahren
        </p>
      </div>

      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              E-Mail
            </label>
            <UInput
              v-model="credentials.email"
              type="email"
              required
              placeholder="ihre@email.com"
              :disabled="loading"
              class="mt-1"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Passwort
            </label>
            <UInput
              v-model="credentials.password"
              type="password"
              required
              placeholder="Ihr Passwort"
              :disabled="loading"
              class="mt-1"
            />
          </div>

          <UButton
            type="submit"
            :loading="loading"
            block
            size="lg"
          >
            Anmelden
          </UButton>
        </form>

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm font-medium text-blue-800 mb-2">Test-Zugänge:</p>
          <div class="space-y-1 text-xs text-blue-700">
            <p><strong>HR:</strong> hr@testcompany.com / TestPass123!</p>
            <p><strong>Employee:</strong> employee@testcompany.com / TestPass123!</p>
            <p><strong>Admin:</strong> admin@testcompany.com / TestPass123!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const { signIn } = useAuth()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!credentials.value.email || !credentials.value.password) {
    error.value = 'Bitte alle Felder ausfüllen'
    return
  }

  loading.value = true
  error.value = ''

  const result = await signIn(credentials.value)

  if (result.error) {
    error.value = result.error
  } else {
    await navigateTo('/dashboard')
  }

  loading.value = false
}
</script>