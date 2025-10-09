<template>
  <div class="cv-viewer">
    <!-- Keine CV Nachricht -->
    <div v-if="!cvPath" class="alert-info">
      Kein Lebenslauf vorhanden
    </div>

    <!-- Download & Preview Buttons - nur anzeigen wenn CV vorhanden -->
    <div v-else>
      <div class="mb-4 flex gap-3">
        <button
          @click="downloadCv"
          :disabled="loading"
          class="btn-primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ loading ? 'Lädt...' : 'CV Herunterladen' }}
        </button>

        <button
          v-if="canPreview"
          @click="togglePreview"
          class="btn-secondary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ showPreview ? 'Vorschau schließen' : 'Vorschau anzeigen' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="alert-error mb-4">
        {{ error }}
      </div>

      <!-- Preview Section -->
      <div v-if="showPreview && previewUrl" class="preview-container">
        <div class="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
          <iframe
            v-if="fileType === 'pdf'"
            :src="previewUrl"
            class="w-full h-[600px]"
            frameborder="0"
          />
          <img
            v-else-if="fileType === 'image'"
            :src="previewUrl"
            :alt="`CV von ${candidateName}`"
            class="w-full h-auto"
          />
          <div v-else class="p-8 text-center text-gray-500">
            <p>Vorschau für diesen Dateityp nicht verfügbar.</p>
            <p class="text-sm mt-2">Bitte laden dir die Datei herunter, um sie anzuzeigen.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  recommendationId: string
  candidateName: string
  cvPath: string | null
}>()

const loading = ref(false)
const error = ref('')
const showPreview = ref(false)
const previewUrl = ref<string | null>(null)
const fileType = ref<'pdf' | 'image' | 'other'>('other')

const canPreview = computed(() => {
  if (!props.cvPath) return false
  const ext = props.cvPath.split('.').pop()?.toLowerCase()
  return ['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')
})

const getFileType = () => {
  if (!props.cvPath) return 'other'
  const ext = props.cvPath.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'image'
  return 'other'
}

const downloadCv = async () => {
  if (!props.cvPath) {
    error.value = 'Kein Lebenslauf vorhanden'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/recommendations/${props.recommendationId}/cv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Fehler beim Laden des Lebenslaufs')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CV_${props.candidateName.replace(/\s+/g, '_')}.${props.cvPath.split('.').pop()}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err: any) {
    error.value = err.message || 'Fehler beim Herunterladen des Lebenslaufs'
  } finally {
    loading.value = false
  }
}

const togglePreview = async () => {
  if (showPreview.value) {
    showPreview.value = false
    if (previewUrl.value) {
      window.URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    return
  }

  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/recommendations/${props.recommendationId}/cv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Vorschau')
    }

    const blob = await response.blob()
    previewUrl.value = window.URL.createObjectURL(blob)
    fileType.value = getFileType()
    showPreview.value = true
  } catch (err: any) {
    error.value = err.message || 'Fehler beim Laden der Vorschau'
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors;
}

.alert-error {
  @apply bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg;
}

.alert-info {
  @apply bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg;
}
</style>