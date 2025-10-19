<template>
  <div class="cv-viewer">
    <!-- Keine CV Nachricht -->
    <div v-if="!cvPath" class="bg-blue-900/30 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg backdrop-blur-sm">
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Kein Lebenslauf vorhanden
      </div>
    </div>

    <!-- Download & Preview Buttons - nur anzeigen wenn CV vorhanden -->
    <div v-else>
      <div class="mb-4 flex gap-3">
        <button
          @click="downloadCv"
          :disabled="loading"
          class="btn-primary inline-flex items-center"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ loading ? 'Lädt...' : 'CV Herunterladen' }}
        </button>

        <button
          v-if="canPreview"
          @click="togglePreview"
          class="btn-secondary inline-flex items-center"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ showPreview ? 'Vorschau schließen' : 'Vorschau anzeigen' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm mb-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="showPreview && previewUrl" class="preview-container mt-4">
        <div class="border-2 border-gray-600 rounded-lg overflow-hidden bg-gray-800 shadow-xl">
          <iframe
            v-if="fileType === 'pdf'"
            :src="previewUrl"
            class="w-full h-[600px] bg-white"
            frameborder="0"
          />
          <img
            v-else-if="fileType === 'image'"
            :src="previewUrl"
            :alt="`CV von ${candidateName}`"
            class="w-full h-auto"
          />
          <div v-else class="p-8 text-center text-muted">
            <p>Vorschau für diesen Dateityp nicht verfügbar.</p>
            <p class="text-sm mt-2">Bitte lade die Datei herunter, um sie anzuzeigen.</p>
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