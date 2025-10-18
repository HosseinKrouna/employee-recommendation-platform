<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-2xl">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="heading-1 mb-2">Account erstellen</h1>
        <p class="text-muted">Registriere dich und starte mit Empfehlungen</p>
      </div>

      <!-- Register Card -->
      <div class="card">
        <!-- Error Alert -->
        <div v-if="error" class="alert-error mb-6">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚠️</span>
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister">
          <!-- Personal Info -->
          <div class="mb-6">
            <h3 class="heading-4 mb-4">Persönliche Informationen</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- First Name -->
              <div class="form-group">
                <label for="firstName" class="form-label">
                  Vorname *
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="Max"
                  class="input"
                  :disabled="loading"
                />
              </div>

              <!-- Last Name -->
              <div class="form-group">
                <label for="lastName" class="form-label">
                  Nachname *
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="Mustermann"
                  class="input"
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                E-Mail-Adresse *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="max.mustermann@company.com"
                class="input"
                :disabled="loading"
              />
              <p class="form-hint">
                Verwende deine geschäftliche E-Mail-Adresse
              </p>
            </div>

            <!-- Department -->
            <div class="form-group">
              <label for="department" class="form-label">
                Abteilung *
              </label>
              <select
                id="department"
                v-model="form.department"
                required
                class="select"
                :disabled="loading"
              >
                <option value="">Bitte wählen</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Product">Product</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Other">Andere</option>
              </select>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Account Security -->
          <div class="mb-6">
            <h3 class="heading-4 mb-4">Sicherheit</h3>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="form-label">
                Passwort *
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                placeholder="Mindestens 8 Zeichen"
                class="input"
                :disabled="loading"
                @input="validatePassword"
              />
              <p class="form-hint">
                Mindestens 8 Zeichen, inklusive Großbuchstaben, Kleinbuchstaben und Zahlen
              </p>
            </div>

            <!-- Password Confirm -->
            <div class="form-group">
              <label for="passwordConfirm" class="form-label">
                Passwort bestätigen *
              </label>
              <input
                id="passwordConfirm"
                v-model="form.passwordConfirm"
                type="password"
                required
                placeholder="Passwort wiederholen"
                class="input"
                :disabled="loading"
                @input="validatePasswordMatch"
              />
              <p v-if="passwordMismatch" class="form-error">
                Passwörter stimmen nicht überein
              </p>
            </div>

            <!-- Password Strength Indicator -->
            <div v-if="form.password" class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-muted">Passwortstärke:</span>
                <span :class="passwordStrengthClass">
                  {{ passwordStrengthText }}
                </span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="passwordStrengthBarClass"
                  :style="{ width: passwordStrengthPercentage + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Terms & Conditions -->
          <div class="form-group">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="form.acceptTerms"
                type="checkbox"
                required
                class="checkbox mt-1"
                :disabled="loading"
              />
              <span class="text-sm text-secondary">
                Ich akzeptiere die
                <a href="/terms" target="_blank" class="text-link">Nutzungsbedingungen</a>
                und die
                <a href="/privacy" target="_blank" class="text-link">Datenschutzerklärung</a>
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading || passwordMismatch || !isFormValid"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <span class="spinner w-4 h-4"></span>
              Wird registriert...
            </span>
            <span v-else>Account erstellen</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-muted">
            Bereits registriert?
            <NuxtLink to="/login" class="text-link">
              Jetzt anmelden
            </NuxtLink>
          </p>
        </div>
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
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  password: '',
  passwordConfirm: '',
  acceptTerms: false
})

const loading = ref(false)
const error = ref('')
const passwordMismatch = ref(false)

const router = useRouter()

// Password validation
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let strength = 0
  
  // Length
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 25
  
  // Complexity
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 10
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10
  
  return Math.min(strength, 100)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'Schwach'
  if (strength < 60) return 'Mittel'
  if (strength < 80) return 'Gut'
  return 'Sehr gut'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'text-red-400'
  if (strength < 60) return 'text-yellow-400'
  if (strength < 80) return 'text-blue-400'
  return 'text-green-400'
})

const passwordStrengthBarClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'bg-red-500'
  if (strength < 60) return 'bg-yellow-500'
  if (strength < 80) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthPercentage = computed(() => passwordStrength.value)

const isFormValid = computed(() => {
  return (
    form.value.firstName &&
    form.value.lastName &&
    form.value.email &&
    form.value.department &&
    form.value.password.length >= 8 &&
    form.value.passwordConfirm &&
    !passwordMismatch.value &&
    form.value.acceptTerms
  )
})

const validatePassword = () => {
  // Validate password match if confirm field is filled
  if (form.value.passwordConfirm) {
    validatePasswordMatch()
  }
}

const validatePasswordMatch = () => {
  passwordMismatch.value = 
    form.value.password !== form.value.passwordConfirm &&
    form.value.passwordConfirm.length > 0
}

const handleRegister = async () => {
  error.value = ''
  
  // Final validation
  if (!isFormValid.value) {
    error.value = 'Bitte fülle alle Pflichtfelder korrekt aus'
    return
  }
  
  if (passwordMismatch.value) {
    error.value = 'Passwörter stimmen nicht überein'
    return
  }

  loading.value = true

  try {
    const { data, error: registerError } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        department: form.value.department,
        password: form.value.password
      }
    })

    if (registerError.value) {
      error.value = registerError.value.data?.message || 'Registrierung fehlgeschlagen'
      return
    }

    // Erfolg - weiterleiten zum Login mit Email
    router.push({
      path: '/login',
      query: {
        registered: 'true',
        email: form.value.email
      }
    })
  } catch (err) {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten'
    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}
</script>