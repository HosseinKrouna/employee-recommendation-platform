<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-semibold text-gray-900">
            Dashboard
          </h1>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Willkommen, {{ data?.user?.firstName }}!
            </span>
            <UBadge :color="getRoleColor(data?.user?.role)" variant="subtle">
              {{ data?.user?.role }}
            </UBadge>
            <UButton @click="handleLogout" variant="ghost" size="sm">
              Abmelden
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Deine Informationen
          </h3>
          <div class="space-y-2">
            <p><span class="font-medium">Name:</span> {{ data?.user?.name }}</p>
            <p><span class="font-medium">E-Mail:</span> {{ data?.user?.email }}</p>
            <p><span class="font-medium">Abteilung:</span> {{ data?.user?.department || 'Nicht angegeben' }}</p>
            <p><span class="font-medium">Rolle:</span> {{ getRoleLabel(data?.user?.role) }}</p>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Schnellaktionen
          </h3>
          <div class="space-y-3">
            <UButton 
              v-if="data?.user?.role !== 'HR'"
              @click="navigateTo('/recommendations/create')"
              block
              icon="i-heroicons-plus"
            >
              Neue Empfehlung
            </UButton>
            <UButton 
              @click="navigateTo('/recommendations')"
              variant="outline"
              block
              icon="i-heroicons-list-bullet"
            >
              Alle Empfehlungen
            </UButton>
            <UButton 
              v-if="data?.user?.role === 'HR' || data?.user?.role === 'ADMIN'"
              @click="navigateTo('/hr/dashboard')"
              variant="outline"
              block
              icon="i-heroicons-chart-bar"
            >
              HR Dashboard
            </UButton>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Statistiken
          </h3>
          <div v-if="statsLoading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <div v-else class="space-y-4">
            <div>
              <p class="text-3xl font-bold text-blue-600">{{ stats.total }}</p>
              <p class="text-sm text-gray-600">
                {{ data?.user?.role === 'HR' || data?.user?.role === 'ADMIN' ? 'Gesamt Empfehlungen' : 'Deine Empfehlungen' }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <p class="text-lg font-semibold text-yellow-600">{{ stats.inReview }}</p>
                <p class="text-xs text-gray-600">In Prüfung</p>
              </div>
              <div>
                <p class="text-lg font-semibold text-green-600">{{ stats.approved }}</p>
                <p class="text-xs text-gray-600">Genehmigt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ data?.user?.role === 'HR' || data?.user?.role === 'ADMIN' ? 'Neueste Empfehlungen' : 'Deine letzten Empfehlungen' }}
          </h2>
          <UButton 
            @click="navigateTo('/recommendations')"
            variant="ghost"
            icon="i-heroicons-arrow-right"
          >
            Alle anzeigen
          </UButton>
        </div>

        <div v-if="recommendationsLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-4">Lade Empfehlungen...</p>
        </div>

        <div v-else-if="recentRecommendations.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Keine Empfehlungen</h3>
          <p class="text-gray-600 mb-4">
            {{ data?.user?.role === 'HR' ? 'Es wurden noch keine Empfehlungen eingereicht.' : 'Du hast noch keine Empfehlungen eingereicht.' }}
          </p>
          <UButton 
            v-if="data?.user?.role !== 'HR'"
            @click="navigateTo('/recommendations/create')"
            icon="i-heroicons-plus"
          >
            Erste Empfehlung erstellen
          </UButton>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="rec in recentRecommendations"
            :key="rec.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ rec.candidateName }}
                  </h3>
                  <UBadge :color="getStatusColor(rec.status)" variant="soft" size="sm">
                    {{ getStatusLabel(rec.status) }}
                  </UBadge>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ rec.position }} · {{ rec.department }}</p>
                <div class="flex flex-wrap gap-1 mb-2">
                  <UBadge
                    v-for="skill in rec.skills.slice(0, 3)"
                    :key="skill"
                    variant="subtle"
                    size="xs"
                  >
                    {{ skill }}
                  </UBadge>
                  <UBadge v-if="rec.skills.length > 3" variant="subtle" size="xs">
                    +{{ rec.skills.length - 3 }} mehr
                  </UBadge>
                </div>
                <p class="text-xs text-gray-500">
                  Empfohlen von {{ rec.recommendedByUser.firstName }} {{ rec.recommendedByUser.lastName }} 
                  · {{ formatDate(rec.createdAt) }}
                </p>
              </div>
              <UButton
                @click="navigateTo(`/recommendations`)"
                variant="ghost"
                size="sm"
                icon="i-heroicons-arrow-right"
              >
                Details
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const { data, signOut } = useAuth()

const recommendationsLoading = ref(true)
const statsLoading = ref(true)
const recentRecommendations = ref([])
const stats = ref({
  total: 0,
  inReview: 0,
  approved: 0
})

async function handleLogout() {
  await signOut()
}

function getRoleColor(role) {
  const colors = {
    'ADMIN': 'red',
    'HR': 'blue',
    'EMPLOYEE': 'green'
  }
  return colors[role] || 'gray'
}

function getRoleLabel(role) {
  const labels = {
    'ADMIN': 'Administrator',
    'HR': 'Personalwesen',
    'EMPLOYEE': 'Mitarbeiter'
  }
  return labels[role] || role
}

function getStatusColor(status) {
  const colors = {
    'SUBMITTED': 'blue',
    'IN_REVIEW': 'yellow',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'WITHDRAWN': 'gray'
  }
  return colors[status] || 'gray'
}

function getStatusLabel(status) {
  const labels = {
    'SUBMITTED': 'Eingereicht',
    'IN_REVIEW': 'In Prüfung',
    'APPROVED': 'Genehmigt',
    'REJECTED': 'Abgelehnt',
    'WITHDRAWN': 'Zurückgezogen'
  }
  return labels[status] || status
}

function formatDate(date) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

async function fetchRecommendations() {
  recommendationsLoading.value = true
  try {
    const response = await $fetch('/api/recommendations')
    const allRecs = response.recommendations
    
    recentRecommendations.value = allRecs.slice(0, 5)
    
    stats.value = {
      total: allRecs.length,
      inReview: allRecs.filter(r => r.status === 'IN_REVIEW').length,
      approved: allRecs.filter(r => r.status === 'APPROVED').length
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  } finally {
    recommendationsLoading.value = false
    statsLoading.value = false
  }
}

onMounted(() => {
  fetchRecommendations()
})
</script>