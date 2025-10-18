<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="heading-1 mb-2">Willkommen zurück</h1>
        <p class="text-muted">Melde dich bei deinem Account an</p>
      </div>

      <!-- Login Card -->
      <div class="card">
        <!-- Error Alert -->
        <div v-if="error" class="alert-error mb-6">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚠️</span>
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="alert-success mb-6">
          <div class="flex items-center gap-2">
            <span class="text-xl">✅</span>
            <span>{{ success }}</span>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="deine@email.com"
              class="input"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="form-label">
              Passwort
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="input"
              :disabled="loading"
            />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between mb-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="checkbox"
                :disabled="loading"
              />
              <span class="text-sm text-secondary">Angemeldet bleiben</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-link text-sm">
              Passwort vergessen?
            </NuxtLink>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <span class="spinner w-4 h-4"></span>
              Wird angemeldet...
            </span>
            <span v-else>Anmelden</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-muted">
            Noch kein Account?
            <NuxtLink to="/register" class="text-link">
              Jetzt registrieren
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="text-center mt-6">
        <p class="text-muted text-sm">
          Probleme beim Anmelden?
          <a href="mailto:support@company.com" class="text-link">
            Support kontaktieren
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const router = useRouter()
const { signIn } = useAuth()

const handleLogin = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const result = await signIn({
      email: form.value.email,
      password: form.value.password
    })

    if (result.error) {
      error.value = result.error
      return
    }

    success.value = 'Erfolgreich angemeldet! Weiterleitung...'
    
    // Kurze Verzögerung für die Success-Message
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (err) {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

// Auto-fill aus URL-Parametern (z.B. nach Registrierung)
onMounted(() => {
  const route = useRoute()
  if (route.query.registered === 'true') {
    success.value = 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.'
  }
  if (route.query.email) {
    form.value.email = route.query.email as string
  }
})
</script>