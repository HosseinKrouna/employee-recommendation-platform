<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-900">HR Dashboard</h1>
            <UBadge color="blue" variant="subtle">{{ data?.user?.role }}</UBadge>
          </div>
          
          <div class="flex items-center space-x-4">
            <UButton @click="navigateTo('/dashboard')" variant="ghost" size="sm">
              Zurück zum Dashboard
            </UButton>
            <UButton @click="handleLogout" variant="ghost" size="sm">
              Abmelden
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <p class="text-sm text-gray-600 mb-1">Gesamt</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 mb-1">Eingereicht</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.submitted }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 mb-1">In Prüfung</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.inReview }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 mb-1">Genehmigt</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.approved }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <UInput
              v-model="searchQuery"
              placeholder="Suche nach Name, Email, Position..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>
          <USelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="Status filtern"
            class="w-48"
          />
          <USelect
            v-model="filterDepartment"
            :options="departmentOptions"
            placeholder="Abteilung filtern"
            class="w-48"
          />
          <UButton
            @click="resetFilters"
            variant="outline"
            icon="i-heroicons-x-mark"
          >
            Zurücksetzen
          </UButton>
        </div>
      </div>

      <!-- Recommendations Table -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            Alle Empfehlungen ({{ filteredRecommendations.length }})
          </h2>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-4">Lade Empfehlungen...</p>
        </div>

        <div v-else-if="filteredRecommendations.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600">Keine Empfehlungen gefunden.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kandidat
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position / Abteilung
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empfohlen von
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="rec in filteredRecommendations"
                :key="rec.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ rec.candidateName }}</div>
                    <div class="text-sm text-gray-500">{{ rec.candidateEmail }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ rec.position }}</div>
                  <div class="text-sm text-gray-500">{{ rec.department }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ rec.recommendedByUser.firstName }} {{ rec.recommendedByUser.lastName }}
                  </div>
                  <div class="text-sm text-gray-500">{{ rec.recommendedByUser.department }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <USelect
                    v-model="rec.status"
                    :options="statusSelectOptions"
                    @change="updateStatus(rec.id, rec.status)"
                    size="sm"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(rec.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <UButton
                      @click="downloadPDF(rec.id)"
                      variant="ghost"
                      size="xs"
                      icon="i-heroicons-arrow-down-tray"
                      :loading="downloadingId === rec.id"
                    >
                      PDF
                    </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['hr'] 
})

const { data, signOut } = useAuth()

const loading = ref(true)
const recommendations = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterDepartment = ref('')
const downloadingId = ref(null)

const statusOptions = ['Alle Status', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']
const departmentOptions = ref(['Alle Abteilungen'])

const statusSelectOptions = [
  { label: 'Eingereicht', value: 'SUBMITTED' },
  { label: 'In Prüfung', value: 'IN_REVIEW' },
  { label: 'Genehmigt', value: 'APPROVED' },
  { label: 'Abgelehnt', value: 'REJECTED' },
  { label: 'Zurückgezogen', value: 'WITHDRAWN' }
]

const stats = computed(() => {
  const total = recommendations.value.length
  const submitted = recommendations.value.filter(r => r.status === 'SUBMITTED').length
  const inReview = recommendations.value.filter(r => r.status === 'IN_REVIEW').length
  const approved = recommendations.value.filter(r => r.status === 'APPROVED').length
  
  return { total, submitted, inReview, approved }
})

const filteredRecommendations = computed(() => {
  let filtered = [...recommendations.value]
  

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(rec =>
      rec.candidateName.toLowerCase().includes(query) ||
      rec.candidateEmail.toLowerCase().includes(query) ||
      rec.position.toLowerCase().includes(query)
    )
  }
  
 
  if (filterStatus.value && filterStatus.value !== 'Alle Status') {
    filtered = filtered.filter(rec => rec.status === filterStatus.value)
  }
  

  if (filterDepartment.value && filterDepartment.value !== 'Alle Abteilungen') {
    filtered = filtered.filter(rec => rec.department === filterDepartment.value)
  }
  
  return filtered
})

const formatDate = (date) => {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

const updateStatus = async (id, newStatus) => {
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

const downloadPDF = async (id) => {
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
    recommendations.value = response.recommendations
    
    const depts = new Set(recommendations.value.map(r => r.department))
    departmentOptions.value = ['Alle Abteilungen', ...Array.from(depts)]
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  await signOut()
}

onMounted(() => {

  if (data.value?.user?.role !== 'HR' && data.value?.user?.role !== 'ADMIN') {
    navigateTo('/dashboard')
    return
  }
  
  fetchRecommendations()
})
</script>