<template>
  <div class="card">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Neue Mitarbeiterempfehlung
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Kandidaten-Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Vollständiger Name *
          </label>
          <UInput
            v-model="form.candidateName"
            required
            placeholder="Max Mustermann"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            E-Mail-Adresse *
          </label>
          <UInput
            v-model="form.candidateEmail"
            type="email"
            required
            placeholder="max@example.com"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Telefonnummer
          </label>
          <UInput
            v-model="form.candidatePhone"
            type="tel"
            placeholder="+49 123 456789"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Position *
          </label>
          <UInput
            v-model="form.position"
            required
            placeholder="Frontend Developer"
            :disabled="loading"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Abteilung *
        </label>
        <USelect
          v-model="form.department"
          :options="departmentOptions"
          required
          :disabled="loading"
        />
      </div>

      <!-- Skills -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Fähigkeiten *
        </label>
        <div class="flex flex-wrap gap-2 mb-2">
          <UBadge
            v-for="skill in form.skills"
            :key="skill"
            variant="soft"
            color="primary"
            size="sm"
          >
            {{ skill }}
            <button
              @click.prevent="removeSkill(skill)"
              class="ml-1 text-primary-700 hover:text-primary-900"
              :disabled="loading"
            >
              ×
            </button>
          </UBadge>
        </div>
        <div class="flex gap-2">
          <UInput
            v-model="newSkill"
            placeholder="Neue Fähigkeit hinzufügen"
            :disabled="loading"
            @keyup.enter="addSkill"
            class="flex-1"
          />
          <UButton
            @click="addSkill"
            variant="outline"
            :disabled="loading || !newSkill.trim()"
          >
            Hinzufügen
          </UButton>
        </div>
      </div>

      <!-- Erfahrung -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Berufserfahrung *
        </label>
        <UTextarea
          v-model="form.experience"
          required
          :rows="4"
          placeholder="Beschreiben Sie die relevante Berufserfahrung des Kandidaten..."
          :disabled="loading"
        />
      </div>

      <!-- Notizen -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Zusätzliche Notizen
        </label>
        <UTextarea
          v-model="form.notes"
          :rows="3"
          placeholder="Zusätzliche Informationen oder Kommentare..."
          :disabled="loading"
        />
      </div>

      <!-- CV Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Lebenslauf (optional)
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            @change="handleFileUpload"
            class="hidden"
          />
          
          <div v-if="!uploadedFile" class="text-center">
            <UButton
              @click="$refs.fileInput.click()"
              variant="outline"
              :loading="uploading"
            >
              CV hochladen
            </UButton>
            <p class="text-xs text-gray-500 mt-1">
              PDF, DOC oder DOCX (max. 10MB)
            </p>
          </div>

          <div v-else class="flex items-center justify-between">
            <div class="flex items-center">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-green-600 mr-2" />
              <span class="text-sm text-gray-900">{{ uploadedFile.originalname }}</span>
            </div>
            <UButton
              @click="removeFile"
              variant="ghost"
              color="red"
              size="sm"
            >
              Entfernen
            </UButton>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-3">
        <UButton
          type="button"
          variant="outline"
          @click="resetForm"
          :disabled="loading"
        >
          Zurücksetzen
        </UButton>
        <UButton
          type="submit"
          :loading="loading"
        >
          Empfehlung einreichen
        </UButton>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="success" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mr-2" />
        <span class="text-green-800">Empfehlung erfolgreich eingereicht!</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 mr-2" />
        <span class="text-red-800">{{ error }}</span>
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