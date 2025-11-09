<template>
  <div class="page-container">
    <div class="page-header">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="heading-1">Meine Empfehlungen</h1>
          <p class="text-muted">Verwalte alle deine eingereichten Kandidaten</p>
        </div>
        <NuxtLink to="/recommendations/new" class="btn-primary">
          ➕ Neue Empfehlung
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="form-label">Suche</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Name oder Position..."
            class="input"
          />
        </div>
        
        <div>
          <label class="form-label">Status</label>
          <select v-model="filters.status" class="select">
            <option value="">Alle Status</option>
            <option value="SUBMITTED">Eingereicht</option>
            <option value="IN_REVIEW">In Prüfung</option>
            <option value="APPROVED">Genehmigt</option>
            <option value="REJECTED">Abgelehnt</option>
          </select>
        </div>

        <div>
          <label class="form-label">Sortierung</label>
          <select v-model="filters.sortBy" class="select">
            <option value="createdAt-desc">Neueste zuerst</option>
            <option value="createdAt-asc">Älteste zuerst</option>
            <option value="candidateName">Name (A-Z)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <p class="text-muted text-sm">
          {{ filteredRecommendations.length }} Empfehlung(en) gefunden
        </p>
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="text-link text-sm"
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>

    <!-- Recommendations List -->
    <div v-if="loading" class="card text-center py-12">
      <div class="spinner w-8 h-8 mx-auto mb-4"></div>
      <p class="text-muted">Lädt Empfehlungen...</p>
    </div>

    <div v-else-if="filteredRecommendations.length === 0" class="card text-center py-12">
      <div class="text-6xl mb-4">📭</div>
      <h3 class="heading-3">Keine Empfehlungen gefunden</h3>
      <p class="text-muted mb-6">
        {{ hasActiveFilters ? 'Versuche andere Filtereinstellungen' : 'Erstelle deine erste Empfehlung' }}
      </p>
      <NuxtLink v-if="!hasActiveFilters" to="/recommendations/new" class="btn-primary inline-block">
        Erste Empfehlung erstellen
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="rec in filteredRecommendations"
        :key="rec.id"
        class="card-hover"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-primary text-xl">{{ rec.candidateName }}</h3>
              <span :class="getStatusBadgeClass(rec.status)">
                {{ getStatusText(rec.status) }}
              </span>
            </div>
            <p class="text-secondary mb-1">📋 {{ rec.position }}</p>
            <p class="text-muted text-sm">✉️ {{ rec.candidateEmail }}</p>
          </div>
        </div>

        <div class="mb-4">
          <p v-if="rec.motivation" class="text-secondary text-sm truncate-3-lines">
            {{ rec.motivation }}
          </p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-gray-700">
          <div class="text-muted text-sm">
            <span>📅 {{ formatDate(rec.createdAt) }}</span>
            <span v-if="rec.updatedAt !== rec.createdAt" class="ml-4">
              🔄 {{ formatDate(rec.updatedAt) }}
            </span>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              :to="`/recommendations/${rec.id}`"
              class="btn-outline"
            >
              Details
            </NuxtLink>
            <NuxtLink
              :to="`/recommendations/${rec.id}/edit`"
              class="btn-secondary"
            >
              Bearbeiten
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination (optional for later) -->
    <div v-if="totalPages > 1" class="card mt-6">
      <div class="flex items-center justify-center gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn-outline"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        >
          ← Zurück
        </button>
        <span class="text-muted px-4">
          Seite {{ currentPage }} von {{ totalPages }}
        </span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn-outline"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        >
          Weiter →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'employee-only']
})

interface Recommendation {
  id: string
  candidateName: string
  position: string
  candidateEmail: string
  candidatePhone?: string | null
  candidateLinkedIn?: string | null
  motivation?: string | null
  skills?: string[] | null
  experience?: string | null
  cv?: string | null
  cvFilePath?: string | null
  cvFileName?: string | null
  status: string
  createdAt: string
  updatedAt: string
  recommendedById: string
  recommendedByUser?: {
    email: string
    firstName: string
    lastName: string
    department: string | null
  }
}

const recommendations = ref<Recommendation[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = ref({
  search: '',
  status: '',
  sortBy: 'createdAt-desc'
})

onMounted(async () => {
  await loadRecommendations()
})

// ✅ FIX: Verwende fetch() mit Authorization Header statt useFetch
const loadRecommendations = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/recommendations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Fehler beim Laden')
    }
    
    const data = await response.json()
    
    // Handle both response formats
    recommendations.value = Array.isArray(data) 
      ? data 
      : (data.recommendations || [])
      
  } catch (error) {
    console.error('Fehler beim Laden:', error)
  } finally {
    loading.value = false
  }
}

const filteredRecommendations = computed(() => {
  let result = [...recommendations.value]

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(r =>
      r.candidateName.toLowerCase().includes(search) ||
      r.position.toLowerCase().includes(search) ||
      r.candidateEmail.toLowerCase().includes(search)
    )
  }

  // Filter by status
  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status)
  }

  // ✅ FIX: Erweiterte Sortierung mit Älteste/Neueste
  result.sort((a, b) => {
    if (filters.value.sortBy === 'createdAt-desc') {
      // Neueste zuerst
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (filters.value.sortBy === 'createdAt-asc') {
      // Älteste zuerst
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (filters.value.sortBy === 'candidateName') {
      return a.candidateName.localeCompare(b.candidateName)
    } else if (filters.value.sortBy === 'status') {
      return a.status.localeCompare(b.status)
    }
    return 0
  })

  return result
})

const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.status || filters.value.sortBy !== 'createdAt-desc'
})

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    sortBy: 'createdAt-desc'
  }
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'SUBMITTED': 'badge badge-status-submitted',
    'IN_REVIEW': 'badge badge-status-review',
    'APPROVED': 'badge badge-status-approved',
    'REJECTED': 'badge badge-status-rejected',
    'WITHDRAWN': 'badge badge-status-withdrawn'
  }
  return classes[status] || 'badge'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'SUBMITTED': 'Eingereicht',
    'IN_REVIEW': 'In Prüfung',
    'APPROVED': 'Genehmigt',
    'REJECTED': 'Abgelehnt',
    'WITHDRAWN': 'Zurückgezogen'
  }
  return texts[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>