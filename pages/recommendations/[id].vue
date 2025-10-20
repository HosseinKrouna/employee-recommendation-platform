<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 absolute top-0"></div>
      </div>
      <p class="mt-6 text-muted text-lg">Empfehlung wird geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto">
      <div class="bg-red-900/30 border-l-4 border-red-500 rounded-lg p-6 shadow-lg backdrop-blur-sm">
        <div class="flex items-center">
          <svg class="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-200 font-medium">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Recommendation Details -->
    <div v-else-if="recommendation" class="space-y-6">
      <!-- Back Button & Header -->
      <div class="page-header">
        <NuxtLink 
          to="/dashboard" 
          class="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors group mb-6"
        >
          <svg class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück zum Dashboard
        </NuxtLink>
        
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="heading-1">{{ recommendation.candidateName }}</h1>
            <div class="flex items-center gap-3 text-lg text-muted">
              <span class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ recommendation.position }}
              </span>
            </div>
          </div>
          <div>
            <span :class="getStatusBadgeClass(recommendation.status)">
              <span :class="getStatusDotClass(recommendation.status)"></span>
              {{ getStatusText(recommendation.status) }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Main Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Candidate Information Card -->
          <div class="card">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
              <h2 class="heading-2 mb-0 flex items-center text-white">
                <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Kandidaten-Informationen
              </h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="group">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors border border-indigo-500/30">
                      <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-muted">E-Mail</p>
                    <a :href="`mailto:${recommendation.candidateEmail}`" class="text-base font-semibold text-primary hover:text-indigo-400 transition-colors">
                      {{ recommendation.candidateEmail }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="group">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors border border-green-500/30">
                      <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-muted">Telefon</p>
                    <a v-if="recommendation.candidatePhone" :href="`tel:${recommendation.candidatePhone}`" class="text-base font-semibold text-primary hover:text-green-400 transition-colors">
                      {{ recommendation.candidatePhone }}
                    </a>
                    <p v-else class="text-base text-gray-500">Nicht angegeben</p>
                  </div>
                </div>
              </div>

              <div class="group">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors border border-purple-500/30">
                      <svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-muted">Erfahrung</p>
                    <p class="text-base font-semibold text-primary">{{ recommendation.experience || 'Nicht angegeben' }}</p>
                  </div>
                </div>
              </div>

              <div class="group">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                      <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-muted">Eingereicht am</p>
                    <p class="text-base font-semibold text-primary">{{ formatDate(recommendation.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="recommendation.notes" class="mt-6 pt-6 border-t border-gray-700">
              <div class="flex items-start">
                <svg class="h-5 w-5 text-gray-500 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-muted mb-2">Notizen</p>
                  <p class="text-secondary leading-relaxed">{{ recommendation.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Skills Card -->
          <div v-if="recommendation.skills && recommendation.skills.length > 0" class="card">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
              <h2 class="heading-2 mb-0 flex items-center text-white">
                <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Fähigkeiten & Expertise
              </h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="skill in recommendation.skills" :key="skill.name" class="group">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold text-secondary group-hover:text-purple-400 transition-colors">{{ skill.name }}</span>
                  <span class="text-sm font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">{{ skill.level }}%</span>
                </div>
                <div class="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner border border-gray-600">
                  <div 
                    class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    :class="getSkillColor(skill.level)"
                    :style="`width: ${skill.level}%`"
                  >
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CV Section -->
          <div class="card">
            <div class="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
              <h2 class="heading-2 mb-0 flex items-center text-white">
                <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lebenslauf (CV)
              </h2>
            </div>
            
            <CvViewer
              :recommendation-id="recommendation.id"
              :candidate-name="recommendation.candidateName"
              :cv-path="recommendation.cvFilePath"
            />
          </div>
        </div>

        <!-- Right Column - Status Info -->
        <div class="space-y-6">
          <!-- Status Info Card -->
          <div class="card">
            <div class="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
              <h2 class="heading-2 mb-0 flex items-center text-white">
                <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status-Information
              </h2>
            </div>
            
            <div class="space-y-4">
              <div>
                <p class="text-sm text-muted mb-2">Aktueller Status:</p>
                <span :class="getStatusBadgeClass(recommendation.status)">
                  <span :class="getStatusDotClass(recommendation.status)"></span>
                  {{ getStatusText(recommendation.status) }}
                </span>
              </div>
              
              <!-- Zurückziehen Button -->
              <div v-if="canWithdraw" class="pt-4 border-t border-gray-700">
                <button
                  @click="withdrawRecommendation"
                  :disabled="withdrawing"
                  class="btn-outline w-full text-red-400 border-red-500/50 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {{ withdrawing ? 'Wird zurückgezogen...' : 'Empfehlung zurückziehen' }}
                </button>
                <p class="text-xs text-muted mt-2">
                  Du kannst diese Empfehlung zurückziehen, solange sie noch nicht in Prüfung ist.
                </p>
              </div>
              
              <div v-else class="pt-4 border-t border-gray-700">
                <p class="text-sm text-muted">
                  Du wirst per E-Mail benachrichtigt, wenn sich der Status deiner Empfehlung ändert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const recommendation = ref<any>(null)
const loading = ref(true)
const error = ref('')
const withdrawing = ref(false)

// Computed: Kann zurückgezogen werden?
const canWithdraw = computed(() => {
  return recommendation.value?.status === 'SUBMITTED'
})

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    SUBMITTED: 'badge badge-status-submitted inline-flex items-center',
    IN_REVIEW: 'badge badge-status-review inline-flex items-center',
    APPROVED: 'badge badge-status-approved inline-flex items-center',
    REJECTED: 'badge badge-status-rejected inline-flex items-center',
    WITHDRAWN: 'badge badge-status-withdrawn inline-flex items-center'
  }
  return classes[status] || 'badge inline-flex items-center'
}

const getStatusDotClass = (status: string) => {
  const colors: Record<string, string> = {
    SUBMITTED: 'h-2.5 w-2.5 rounded-full mr-2 bg-blue-400 animate-pulse',
    IN_REVIEW: 'h-2.5 w-2.5 rounded-full mr-2 bg-yellow-400 animate-pulse',
    APPROVED: 'h-2.5 w-2.5 rounded-full mr-2 bg-green-400 animate-pulse',
    REJECTED: 'h-2.5 w-2.5 rounded-full mr-2 bg-red-400 animate-pulse',
    WITHDRAWN: 'h-2.5 w-2.5 rounded-full mr-2 bg-gray-400'
  }
  return colors[status] || 'h-2.5 w-2.5 rounded-full mr-2 bg-gray-400'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    SUBMITTED: 'Eingereicht',
    IN_REVIEW: 'In Prüfung',
    APPROVED: 'Genehmigt',
    REJECTED: 'Abgelehnt',
    WITHDRAWN: 'Zurückgezogen'
  }
  return texts[status] || status
}

const getSkillColor = (level: number) => {
  if (level >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500'
  if (level >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
  if (level >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  return 'bg-gradient-to-r from-red-500 to-pink-500'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchRecommendation = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/recommendations/${route.params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Empfehlung')
    }

    const data = await response.json()
    recommendation.value = data.recommendation
  } catch (err: any) {
    error.value = err.message || 'Fehler beim Laden der Empfehlung'
  } finally {
    loading.value = false
  }
}

// Funktion: Empfehlung zurückziehen
const withdrawRecommendation = async () => {
  if (!confirm('Möchtest du diese Empfehlung wirklich zurückziehen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    return
  }

  withdrawing.value = true

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/recommendations/${route.params.id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'WITHDRAWN' })
    })

    if (!response.ok) {
      throw new Error('Fehler beim Zurückziehen')
    }

    // Update local state
    if (recommendation.value) {
      recommendation.value.status = 'WITHDRAWN'
    }

    alert('Empfehlung erfolgreich zurückgezogen')
    
    // Optional: Zurück zum Dashboard nach 2 Sekunden
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err: any) {
    console.error('Error withdrawing recommendation:', err)
    alert('Fehler beim Zurückziehen der Empfehlung')
  } finally {
    withdrawing.value = false
  }
}

onMounted(() => {
  fetchRecommendation()
})
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>