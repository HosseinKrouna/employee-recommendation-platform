<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Kandidaten-Info -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
          <svg class="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Kandidaten-Informationen
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Vollständiger Name *
            </label>
            <input
              v-model="form.candidateName"
              required
              placeholder="Max Mustermann"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              E-Mail-Adresse *
            </label>
            <input
              v-model="form.candidateEmail"
              type="email"
              required
              placeholder="max@example.com"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Telefonnummer
            </label>
            <input
              v-model="form.candidatePhone"
              type="tel"
              placeholder="+49 123 456789"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Position *
            </label>
            <input
              v-model="form.position"
              required
              placeholder="Frontend Developer"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <!-- Abteilung -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Abteilung *
        </label>
        <select
          v-model="form.department"
          required
          :disabled="loading"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all"
        >
          <option value="" disabled class="text-gray-500">Abteilung auswählen</option>
          <option v-for="dept in departmentOptions" :key="dept" :value="dept" class="text-gray-100">
            {{ dept }}
          </option>
        </select>
      </div>

      <!-- Skills -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <svg class="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Fähigkeiten * (mindestens eine erforderlich)
        </label>
        <div class="flex flex-wrap gap-2 mb-3" v-if="form.skills.length > 0">
          <span
            v-for="skill in form.skills"
            :key="skill"
            class="inline-flex items-center px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium border border-indigo-500/30"
          >
            {{ skill }}
            <button
              type="button"
              @click.prevent="removeSkill(skill)"
              class="ml-2 text-indigo-300 hover:text-indigo-100 font-bold"
              :disabled="loading"
            >
              ×
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newSkill"
            placeholder="Neue Fähigkeit hinzufügen und Enter drücken"
            :disabled="loading"
            @keydown.enter.prevent="addSkill"
            class="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
          />
          <button
            type="button"
            @click.prevent="addSkill"
            :disabled="loading || !newSkill.trim()"
            class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all font-medium border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hinzufügen
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Hinzugefügte Skills: {{ form.skills.length }}
        </p>
      </div>

      <!-- Erfahrung -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <svg class="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Berufserfahrung *
        </label>
        <textarea
          v-model="form.experience"
          required
          :rows="4"
          placeholder="Beschreiben Sie die relevante Berufserfahrung des Kandidaten..."
          :disabled="loading"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500 resize-none"
        />
      </div>

      <!-- Notizen -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <svg class="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Zusätzliche Notizen
        </label>
        <textarea
          v-model="form.notes"
          :rows="3"
          placeholder="Zusätzliche Informationen oder Kommentare..."
          :disabled="loading"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500 resize-none"
        />
      </div>

      <!-- CV Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <svg class="h-4 w-4 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Lebenslauf (optional)
        </label>
        <div class="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-800/30 hover:border-indigo-500/50 transition-all">
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            @change="handleFileUpload"
            class="hidden"
          />
          
          <div v-if="!uploadedFile" class="text-center">
            <button
              type="button"
              @click="$refs.fileInput.click()"
              :disabled="uploading"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <svg v-if="uploading" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {{ uploading ? 'Lädt hoch...' : 'CV hochladen' }}
            </button>
            <p class="text-xs text-gray-500 mt-3">
              PDF, DOC oder DOCX (max. 10MB)
            </p>
          </div>

          <div v-else class="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <span class="text-sm font-medium text-green-300">{{ uploadedFile.originalname }}</span>
                <p class="text-xs text-gray-400">Erfolgreich hochgeladen</p>
              </div>
            </div>
            <button
              type="button"
              @click="removeFile"
              class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all text-sm font-medium border border-red-500/30"
            >
              Entfernen
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          @click="resetForm"
          :disabled="loading"
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all font-semibold border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Zurücksetzen
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Wird eingereicht...' : 'Empfehlung einreichen' }}
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="success" class="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg backdrop-blur-sm animate-fadeIn">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-green-200 font-medium">Empfehlung erfolgreich eingereicht!</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg backdrop-blur-sm animate-fadeIn">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-red-200 font-medium">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['submitted'])

const form = ref({
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  position: '',
  department: '',
  skills: [],
  experience: '',
  notes: ''
})

const newSkill = ref('')
const uploadedFile = ref(null)
const loading = ref(false)
const uploading = ref(false)
const success = ref(false)
const error = ref('')

const departmentOptions = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Design',
  'Product',
  'Customer Success'
]

const addSkill = () => {
  const skill = newSkill.value.trim()
  if (skill && !form.value.skills.includes(skill)) {
    form.value.skills.push(skill)
    newSkill.value = ''
  }
}

const removeSkill = (skill) => {
  const index = form.value.skills.indexOf(skill)
  if (index > -1) {
    form.value.skills.splice(index, 1)
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('cv', file)

    const response = await $fetch('/api/upload/cv', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      uploadedFile.value = response.file
    }
  } catch (err) {
    error.value = 'Fehler beim Hochladen der Datei'
    console.error('Upload error:', err)
  } finally {
    uploading.value = false
  }
}

const removeFile = () => {
  uploadedFile.value = null
  if (event.target) {
    event.target.value = ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const submitData = {
      ...form.value,
      cvFileName: uploadedFile.value?.originalname || null,
      cvFilePath: uploadedFile.value?.path || null
    }

    const response = await $fetch('/api/recommendations', {
      method: 'POST',
      body: submitData
    })

    if (response.success) {
      success.value = true
      emit('submitted', response.recommendation)
      
      setTimeout(() => {
        resetForm()
        success.value = false
      }, 3000)
    }
  } catch (err) {
    error.value = err.data?.statusMessage || 'Fehler beim Einreichen der Empfehlung'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    position: '',
    department: '',
    skills: [],
    experience: '',
    notes: ''
  }
  newSkill.value = ''
  uploadedFile.value = null
  error.value = ''
  success.value = false
}
</script>