<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Lade Empfehlungen...</p>
    </div>

    <div v-else-if="recommendations.length === 0" class="card text-center py-12">
      <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Keine Empfehlungen</h3>
      <p class="text-gray-600">
        {{ emptyMessage }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="recommendation in recommendations"
        :key="recommendation.id"
        class="card hover:shadow-md transition-shadow"
      >
  <div class="flex justify-between items-start mb-4">
  <div>
    <h3 class="text-xl font-bold text-white">
      {{ recommendation.candidateName }}
    </h3>
    <p class="text-sm text-gray-400">{{ recommendation.position }}</p>
  </div>
  <UBadge :color="getStatusColor(recommendation.status)" variant="soft">
    {{ getStatusLabel(recommendation.status) }}
  </UBadge>
</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-600">E-Mail</p>
            <p class="text-sm font-medium">{{ recommendation.candidateEmail }}</p>
          </div>
          <div v-if="recommendation.candidatePhone">
            <p class="text-sm text-gray-600">Telefon</p>
            <p class="text-sm font-medium">{{ recommendation.candidatePhone }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Abteilung</p>
            <p class="text-sm font-medium">{{ recommendation.department }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Empfohlen von</p>
            <p class="text-sm font-medium">
              {{ recommendation.recommendedByUser.firstName }} 
              {{ recommendation.recommendedByUser.lastName }}
            </p>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">Fähigkeiten</p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in recommendation.skills"
              :key="skill"
              variant="subtle"
              size="sm"
            >
              {{ skill }}
            </UBadge>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-1">Berufserfahrung</p>
          <p class="text-sm text-gray-800 line-clamp-3">{{ recommendation.experience }}</p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t">
          <span class="text-xs text-gray-500">
            Eingereicht am {{ formatDate(recommendation.createdAt) }}
          </span>
          
          <div class="flex gap-2">
            <UButton
              @click="downloadPDF(recommendation.id)"
              variant="outline"
              size="sm"
              icon="i-heroicons-arrow-down-tray"
              :loading="downloadingId === recommendation.id"
            >
              PDF Download
            </UButton>
            
            <UButton
              @click="$emit('view', recommendation)"
              variant="ghost"
              size="sm"
              icon="i-heroicons-eye"
            >
              Details
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  recommendations: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'Noch keine Empfehlungen vorhanden.'
  }
})

const emit = defineEmits(['view'])

const downloadingId = ref(null)

const formatDate = (date) => {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

const getStatusColor = (status) => {
  const colors = {
    'SUBMITTED': 'blue',
    'IN_REVIEW': 'yellow',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'WITHDRAWN': 'gray'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    'SUBMITTED': 'Eingereicht',
    'IN_REVIEW': 'In Prüfung',
    'APPROVED': 'Genehmigt',
    'REJECTED': 'Abgelehnt',
    'WITHDRAWN': 'Zurückgezogen'
  }
  return labels[status] || status
}

const downloadPDF = async (id) => {
  downloadingId.value = id
  
  try {
    const response = await fetch(`/api/recommendations/${id}/pdf`)
    
    if (!response.ok) {
      throw new Error('PDF-Download fehlgeschlagen')
    }
    
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
</script>