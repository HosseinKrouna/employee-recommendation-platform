<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="heading-1">HR Dashboard</h1>
      <p class="text-muted">Übersicht aller Empfehlungen</p>
    </div>

    <!-- Stats Cards -->
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

    <!-- Recommendations Table -->
    <div class="card">
      <div class="flex flex-col gap-4 mb-6">
        <h2 class="heading-2 mb-0">Alle Empfehlungen</h2>
        
        <!-- Filter Row 1 -->
        <div class="flex flex-wrap gap-3">
          <!-- Search by Name -->
          <input
            v-model="searchName"
            type="text"
            placeholder="Kandidat suchen..."
            class="input text-sm py-2 w-52"
          />
          
          <!-- Filter by Position (Dropdown) -->
          <select v-model="filterPosition" class="select text-sm py-2 w-52">
            <option value="">Alle Positionen</option>
            <option v-for="pos in uniquePositions" :key="pos" :value="pos">{{ pos }}</option>
          </select>
          
          <!-- Filter by Recommended By -->
          <select v-model="filterRecommendedBy" class="select text-sm py-2 w-52">
            <option value="">Alle Mitarbeiter</option>
            <option v-for="emp in uniqueEmployees" :key="emp.id" :value="emp.id">
              {{ emp.name }} ({{ emp.department }})
            </option>
          </select>
          
          <!-- Filter by Status -->
          <select v-model="filterStatus" class="select text-sm py-2 w-44">
            <option value="">Alle Status</option>
            <option value="SUBMITTED">Eingereicht</option>
            <option value="IN_REVIEW">In Prüfung</option>
            <option value="APPROVED">Genehmigt</option>
            <option value="REJECTED">Abgelehnt</option>
            <option value="WITHDRAWN">Zurückgezogen</option>
          </select>
        </div>
        
        <!-- Filter Row 2 - Date Range -->
        <div class="flex flex-wrap gap-3 items-center">
          <label class="text-sm text-gray-400">Zeitraum:</label>
          <input
            v-model="dateFrom"
            type="date"
            class="input text-sm py-2 w-44"
            placeholder="Von"
          />
          <span class="text-gray-400">bis</span>
          <input
            v-model="dateTo"
            type="date"
            class="input text-sm py-2 w-44"
            placeholder="Bis"
          />
          
          <!-- Clear Filters Button -->
          <button
            @click="clearFilters"
            class="btn-outline text-sm py-2 px-4"
          >
            🔄 Filter zurücksetzen
          </button>
          
          <!-- Results Count -->
          <span class="text-sm text-gray-400 ml-auto">
            {{ filteredRecommendations.length }} von {{ recommendations.length }} Empfehlungen
          </span>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-muted">Lädt...</p>
      </div>

      <div v-else-if="filteredRecommendations.length === 0" class="text-center py-8">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-muted">Keine Empfehlungen gefunden</p>
      </div>

      <div v-else class="table-container">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kandidat</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Position</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Empfohlen von</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Eingereicht am</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in filteredRecommendations" :key="rec.id" class="h-16 border-b border-gray-700 hover:bg-gray-800/50">
              <td class="px-4 py-4">
                <div>
                  <p class="font-semibold text-primary">{{ rec.candidateName }}</p>
                  <p class="text-sm text-muted">{{ rec.candidateEmail }}</p>
                </div>
              </td>
              <td class="px-4 py-4">{{ rec.position }}</td>
              <td class="px-4 py-4">
                <div v-if="rec.recommendedByUser">
                  <p class="text-secondary">{{ rec.recommendedByUser.firstName }} {{ rec.recommendedByUser.lastName }}</p>
                  <p class="text-sm text-muted">{{ rec.recommendedByUser.department }}</p>
                </div>
              </td>
              <td class="px-4 py-4">
                <span :class="getStatusBadgeClass(rec.status)">
                  {{ getStatusText(rec.status) }}
                </span>
              </td>
              <td class="px-4 py-4">{{ formatDate(rec.createdAt) }}</td>
              <td class="px-4 py-4">
                <div class="flex gap-2 items-center h-10">
                  <!-- Status Change Dropdown - Fixed Width & Height -->
                  <select 
                    v-if="rec.status !== 'WITHDRAWN'"
                    @change="changeStatus(rec.id, $event)"
                    class="select text-sm h-10 w-36 py-0"
                    :disabled="updatingStatus === rec.id"
                  >
                    <option value="">Status ändern</option>
                    <option value="IN_REVIEW" :disabled="rec.status === 'IN_REVIEW'">In Prüfung</option>
                    <option value="APPROVED" :disabled="rec.status === 'APPROVED'">Genehmigen</option>
                    <option value="REJECTED" :disabled="rec.status === 'REJECTED'">Ablehnen</option>
                  </select>
                  
                  <!-- Placeholder wenn WITHDRAWN -->
                  <div v-else class="w-36 h-10"></div>

                  <!-- View Details Button - Fixed Width & Height -->
                  <NuxtLink 
                    :to="`/hr/recommendations/${rec.id}`"
                    class="btn-secondary text-sm h-10 w-20 flex items-center justify-center py-0"
                  >
                    Details
                  </NuxtLink>

                  <!-- CV Button or Placeholder - Fixed Width & Height -->
                  <button
                    v-if="rec.cvFilePath"
                    @click="downloadCv(rec.id, rec.candidateName)"
                    class="btn-outline text-sm h-10 w-16 flex items-center justify-center py-0"
                    title="CV herunterladen"
                  >
                    📄
                  </button>
                  <div v-else class="w-16 h-10 flex items-center justify-center text-gray-600" title="Kein CV vorhanden">
                    <span class="text-sm">—</span>
                  </div>
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
  middleware: ['auth']
})

interface Recommendation {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  status: string
  createdAt: string
  cvFilePath?: string | null
  recommendedByUser?: {
    id?: string
    firstName: string
    lastName: string
    department: string | null
  }
}

const recommendations = ref<Recommendation[]>([])
const loading = ref(true)
const filterStatus = ref('')
const searchName = ref('')
const searchPosition = ref('')
const sortOrder = ref('desc')
const updatingStatus = ref<string | null>(null)

// ✅ NEUE FILTER-VARIABLEN
const filterPosition = ref('')
const filterRecommendedBy = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// ✅ COMPUTED FÜR UNIQUE POSITIONEN
const uniquePositions = computed(() => {
  const positions = recommendations.value.map(r => r.position)
  return [...new Set(positions)].sort()
})

// ✅ COMPUTED FÜR UNIQUE EMPLOYEES
const uniqueEmployees = computed(() => {
  const employees = recommendations.value
    .filter(r => r.recommendedByUser)
    .map(r => ({
      id: r.recommendedByUser!.firstName + '_' + r.recommendedByUser!.lastName,
      name: `${r.recommendedByUser!.firstName} ${r.recommendedByUser!.lastName}`,
      department: r.recommendedByUser!.department || 'Unbekannt'
    }))
  
  // Remove duplicates based on name
  const unique = employees.filter((emp, index, self) =>
    index === self.findIndex(e => e.name === emp.name)
  )
  
  return unique.sort((a, b) => a.name.localeCompare(b.name))
})

const stats = computed(() => ({
  total: recommendations.value.length,
  submitted: recommendations.value.filter(r => r.status === 'SUBMITTED').length,
  inReview: recommendations.value.filter(r => r.status === 'IN_REVIEW').length,
  approved: recommendations.value.filter(r => r.status === 'APPROVED').length
}))

const filteredRecommendations = computed(() => {
  let filtered = [...recommendations.value]
  
  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(r => r.status === filterStatus.value)
  }
  
  // Search by candidate name
  if (searchName.value) {
    filtered = filtered.filter(r => 
      r.candidateName.toLowerCase().includes(searchName.value.toLowerCase()) ||
      r.candidateEmail.toLowerCase().includes(searchName.value.toLowerCase())
    )
  }
  
  // ✅ FILTER BY POSITION
  if (filterPosition.value) {
    filtered = filtered.filter(r => r.position === filterPosition.value)
  }
  
  // ✅ FILTER BY RECOMMENDED BY
  if (filterRecommendedBy.value) {
    filtered = filtered.filter(r => {
      if (!r.recommendedByUser) return false
      const empId = r.recommendedByUser.firstName + '_' + r.recommendedByUser.lastName
      return empId === filterRecommendedBy.value
    })
  }
  
  // ✅ FILTER BY DATE RANGE
  if (dateFrom.value) {
    filtered = filtered.filter(r => {
      const recDate = new Date(r.createdAt)
      const fromDate = new Date(dateFrom.value)
      return recDate >= fromDate
    })
  }
  
  if (dateTo.value) {
    filtered = filtered.filter(r => {
      const recDate = new Date(r.createdAt)
      const toDate = new Date(dateTo.value)
      toDate.setHours(23, 59, 59, 999) // End of day
      return recDate <= toDate
    })
  }
  
  // Search by position (old searchPosition field)
  if (searchPosition.value) {
    filtered = filtered.filter(r => 
      r.position.toLowerCase().includes(searchPosition.value.toLowerCase())
    )
  }
  
  // Sort by date
  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })
  
  return filtered
})

// ✅ CLEAR FILTERS FUNKTION
const clearFilters = () => {
  filterStatus.value = ''
  searchName.value = ''
  searchPosition.value = ''
  filterPosition.value = ''
  filterRecommendedBy.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

const fetchRecommendations = async () => {
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
    recommendations.value = data.recommendations || []
  } catch (error) {
    console.error('Error loading recommendations:', error)
  } finally {
    loading.value = false
  }
}

const changeStatus = async (id: string, event: Event) => {
  const select = event.target as HTMLSelectElement
  const newStatus = select.value
  
  if (!newStatus) return

  updatingStatus.value = id

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/recommendations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) {
      throw new Error('Fehler beim Aktualisieren')
    }

    // Update local data
    const index = recommendations.value.findIndex(r => r.id === id)
    if (index !== -1) {
      recommendations.value[index].status = newStatus
    }

    // Reset select
    select.value = ''
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Fehler beim Aktualisieren des Status')
    select.value = ''
  } finally {
    updatingStatus.value = null
  }
}

const downloadCv = async (id: string, candidateName: string) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/recommendations/${id}/cv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Fehler beim Laden des CVs')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CV_${candidateName.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading CV:', error)
    alert('Fehler beim Herunterladen des CVs')
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

onMounted(() => {
  fetchRecommendations()
})
</script>