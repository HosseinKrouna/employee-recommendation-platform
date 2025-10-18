<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="heading-1">HR Dashboard</h1>
      <p class="text-muted">Übersicht aller Mitarbeiterempfehlungen</p>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted text-sm">Gesamt</p>
            <h3 class="heading-3 mb-0 mt-1">{{ stats.total }}</h3>
          </div>
          <div class="text-indigo-400 text-4xl">📊</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted text-sm">Eingereicht</p>
            <h3 class="heading-3 mb-0 mt-1">{{ stats.submitted }}</h3>
          </div>
          <div class="text-blue-400 text-4xl">📝</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted text-sm">In Prüfung</p>
            <h3 class="heading-3 mb-0 mt-1">{{ stats.inReview }}</h3>
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

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <label class="form-label">Suche</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Name, Email, Position..."
            class="input"
          />
        </div>
        
        <div>
          <label class="form-label">Status</label>
          <select v-model="filterStatus" class="select">
            <option value="">Alle Status</option>
            <option value="SUBMITTED">Eingereicht</option>
            <option value="IN_REVIEW">In Prüfung</option>
            <option value="APPROVED">Genehmigt</option>
            <option value="REJECTED">Abgelehnt</option>
            <option value="WITHDRAWN">Zurückgezogen</option>
          </select>
        </div>

        <div>
          <label class="form-label">Abteilung</label>
          <select v-model="filterDepartment" class="select">
            <option value="">Alle Abteilungen</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </option>
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

    <!-- Recommendations Table -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="heading-2 mb-0">Alle Empfehlungen</h2>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-muted">Lade Empfehlungen...</p>
      </div>

      <div v-else-if="filteredRecommendations.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-muted">Keine Empfehlungen gefunden.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th class="table-header-cell">Kandidat</th>
              <th class="table-header-cell">Position / Abteilung</th>
              <th class="table-header-cell">Empfohlen von</th>
              <th class="table-header-cell">Status</th>
              <th class="table-header-cell">Datum</th>
              <th class="table-header-cell">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rec in filteredRecommendations"
              :key="rec.id"
              class="table-row"
            >
              <td class="table-cell">
                <div>
                  <div class="text-primary">{{ rec.candidateName }}</div>
                  <div class="text-muted text-sm">{{ rec.candidateEmail }}</div>
                </div>
              </td>
              <td class="table-cell">
                <div class="text-secondary">{{ rec.position }}</div>
                <div class="text-muted text-sm">{{ rec.department || 'Keine Abteilung' }}</div>
              </td>
              <td class="table-cell">
                <div class="text-secondary">
                  {{ rec.recommendedByUser.firstName }} {{ rec.recommendedByUser.lastName }}
                </div>
                <div class="text-muted text-sm">{{ rec.recommendedByUser.department || 'Keine Abteilung' }}</div>
              </td>
              <td class="table-cell">
                <select
                  v-model="rec.status"
                  @change="updateStatus(rec.id, rec.status)"
                  class="select text-sm"
                >
                  <option value="SUBMITTED">Eingereicht</option>
                  <option value="IN_REVIEW">In Prüfung</option>
                  <option value="APPROVED">Genehmigt</option>
                  <option value="REJECTED">Abgelehnt</option>
                  <option value="WITHDRAWN">Zurückgezogen</option>
                </select>
              </td>
              <td class="table-cell text-muted">
                {{ formatDate(rec.createdAt) }}
              </td>
              <td class="table-cell">
                <div class="flex gap-2">
                  <button
                    @click="downloadPDF(rec.id)"
                    class="btn-outline text-xs"
                    :disabled="downloadingId === rec.id"
                  >
                    <span v-if="downloadingId === rec.id">⏳</span>
                    <span v-else>📥 PDF</span>
                  </button>
                  <NuxtLink
                    :to="`/recommendations/${rec.id}`"
                    class="btn-secondary text-xs"
                  >
                    Details
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Recommendation {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  department: string | null
  status: string
  createdAt: string
  recommendedByUser: {
    firstName: string
    lastName: string
    department: string | null
  }
}

const { data } = useAuth()
const loading = ref(true)
const recommendations = ref<Recommendation[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterDepartment = ref('')
const downloadingId = ref<string | null>(null)

// Check if user is HR
onMounted(() => {
  const authData = data.value as { user: { department: string | null } | null }
  const department = authData?.user?.department
  if (department !== 'HR' && department !== 'Human Resources') {
    navigateTo('/dashboard')
    return
  }
  
  fetchRecommendations()
})

const stats = computed(() => {
  const total = recommendations.value.length
  const submitted = recommendations.value.filter(r => r.status === 'SUBMITTED').length
  const inReview = recommendations.value.filter(r => r.status === 'IN_REVIEW').length
  const approved = recommendations.value.filter(r => r.status === 'APPROVED').length
  
  return { total, submitted, inReview, approved }
})

const departments = computed(() => {
  const depts = new Set(
    recommendations.value
      .map(r => r.department)
      .filter((dept): dept is string => dept !== null)
  )
  return Array.from(depts).sort()
})

const filteredRecommendations = computed(() => {
  let filtered = [...recommendations.value]
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(rec =>
      rec.candidateName.toLowerCase().includes(query) ||
      rec.candidateEmail.toLowerCase().includes(query) ||
      rec.position.toLowerCase().includes(query)
    )
  }
  
  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(rec => rec.status === filterStatus.value)
  }
  
  // Filter by department
  if (filterDepartment.value) {
    filtered = filtered.filter(rec => rec.department === filterDepartment.value)
  }
  
  return filtered
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value || filterDepartment.value
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const updateStatus = async (id: string, newStatus: string) => {
  try {
    const response = await $fetch(`/api/recommendations/${id}/status`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    
    if (response.success) {
      console.log('Status updated successfully')
    }
  } catch (error) {
    console.error('Status update failed:', error)
    alert('Fehler beim Aktualisieren des Status')
    await fetchRecommendations()
  }
}

const downloadPDF = async (id: string) => {
  downloadingId.value = id
  
  try {
    const response = await fetch(`/api/recommendations/${id}/pdf`)
    if (!response.ok) throw new Error('PDF-Download fehlgeschlagen')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `empfehlung-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('PDF download error:', error)
    alert('Fehler beim Download der PDF')
  } finally {
    downloadingId.value = null
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterDepartment.value = ''
}

const fetchRecommendations = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/recommendations')
    recommendations.value = Array.isArray(response) ? response : response.recommendations || []
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  } finally {
    loading.value = false
  }
}
</script>