<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="heading-1">Dashboard</h1>
      <p class="text-muted">Übersicht deiner Empfehlungen und Aktivitäten</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted text-sm">Gesamt Empfehlungen</p>
            <h3 class="heading-3 mb-0 mt-1">{{ stats.total }}</h3>
          </div>
          <div class="text-indigo-400 text-4xl">📊</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted text-sm">In Bearbeitung</p>
            <h3 class="heading-3 mb-0 mt-1">{{ stats.pending }}</h3>
          </div>
          <div class="text-yellow-400 text-4xl">⏳</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted text-sm">Genehmigt</p>
            <h3 class="heading-3 mb-0 mt-1">{{ stats.approved }}</h3>
          </div>
          <div class="text-green-400 text-4xl">✅</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card mb-8">
      <h2 class="heading-2">Schnellzugriff</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NuxtLink to="/recommendations/new" class="btn-primary text-center">
          ➕ Neue Empfehlung erstellen
        </NuxtLink>
        <NuxtLink to="/recommendations" class="btn-outline text-center">
          📋 Alle Empfehlungen anzeigen
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Recommendations -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="heading-2 mb-0">Letzte Empfehlungen</h2>
        <NuxtLink to="/recommendations" class="text-link text-sm">
          Alle anzeigen →
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-muted">Lädt...</p>
      </div>

      <div v-else-if="recommendations.length === 0" class="text-center py-8">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-muted mb-4">Noch keine Empfehlungen vorhanden</p>
        <NuxtLink to="/recommendations/new" class="btn-primary inline-block">
          Erste Empfehlung erstellen
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="rec in recommendations"
          :key="rec.id"
          class="card-hover p-4 border border-gray-700 rounded-lg"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-primary text-lg">{{ rec.candidateName }}</h3>
              <p class="text-secondary text-sm mb-2">{{ rec.position }}</p>
              <p v-if="rec.motivation" class="text-muted text-sm truncate-2-lines">{{ rec.motivation }}</p>
            </div>
            <span :class="getStatusBadgeClass(rec.status)">
              {{ getStatusText(rec.status) }}
            </span>
          </div>
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <span class="text-muted text-sm">
              {{ formatDate(rec.createdAt) }}
            </span>
            <NuxtLink
              :to="`/recommendations/${rec.id}`"
              class="text-link text-sm"
            >
              Details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

// Redirect HR to their dashboard
const { data } = useAuth()
onMounted(() => {
  const authData = data.value as { user: { department: string | null } | null }
  const department = authData?.user?.department
  if (department === 'HR' || department === 'Human Resources') {
    navigateTo('/hr/dashboard')
  }
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
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0
})

onMounted(async () => {
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
    const allRecs = Array.isArray(data) 
      ? data 
      : (data.recommendations || [])
    
    
    // Calculate stats from ALL recommendations
    stats.value = {
      total: allRecs.length,
      pending: allRecs.filter((r: Recommendation) => 
        r.status === 'SUBMITTED' || r.status === 'IN_REVIEW'
      ).length,
      approved: allRecs.filter((r: Recommendation) => 
        r.status === 'APPROVED'
      ).length
    }
        
    // Show only the last 5 in the list
    recommendations.value = allRecs.slice(0, 5)
    
  } catch (error) {
    console.error('❌ Error loading recommendations:', error)
  } finally {
    loading.value = false
  }
})

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
    'WITHDRAW': 'Zurückgezogen'
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