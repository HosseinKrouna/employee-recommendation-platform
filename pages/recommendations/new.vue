<template>
  <div class="page-container">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="heading-1">Neue Empfehlung</h1>
          <p class="text-muted">Empfehle einen Kandidaten für eine offene Position</p>
        </div>
        <NuxtLink to="/recommendations" class="btn-outline">
          ← Zurück
        </NuxtLink>
      </div>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="alert-error mb-6">
      {{ error }}
    </div>

    <div v-if="success" class="alert-success mb-6">
      {{ success }}
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Kandidaten Informationen -->
      <div class="card">
        <h2 class="heading-2">Kandidaten-Informationen</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Name -->
          <div class="form-group">
            <label for="candidateName" class="form-label">
              Vollständiger Name *
            </label>
            <input
              id="candidateName"
              v-model="form.candidateName"
              type="text"
              required
              placeholder="Max Mustermann"
              class="input"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="candidateEmail" class="form-label">
              E-Mail-Adresse *
            </label>
            <input
              id="candidateEmail"
              v-model="form.candidateEmail"
              type="email"
              required
              placeholder="max.mustermann@example.com"
              class="input"
            />
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label for="candidatePhone" class="form-label">
              Telefonnummer
            </label>
            <input
              id="candidatePhone"
              v-model="form.candidatePhone"
              type="tel"
              placeholder="+49 123 456789"
              class="input"
            />
          </div>

          <!-- LinkedIn -->
          <div class="form-group">
            <label for="candidateLinkedIn" class="form-label">
              LinkedIn Profil
            </label>
            <input
              id="candidateLinkedIn"
              v-model="form.candidateLinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/..."
              class="input"
            />
          </div>
        </div>
      </div>

      <!-- Position & Abteilung -->
      <div class="card">
        <h2 class="heading-2">Position</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Position -->
          <div class="form-group">
            <label for="position" class="form-label">
              Gewünschte Position *
            </label>
            <input
              id="position"
              v-model="form.position"
              type="text"
              required
              placeholder="z.B. Senior Software Engineer"
              class="input"
            />
          </div>

          <!-- Department -->
          <div class="form-group">
            <label for="department" class="form-label">
              Abteilung *
            </label>
            <select
              id="department"
              v-model="form.department"
              required
              class="select"
            >
              <option value="">Bitte wählen</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Product">Product</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Other">Andere</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Qualifikationen -->
      <div class="card">
        <h2 class="heading-2">Qualifikationen</h2>

        <!-- Skills -->
        <div class="form-group">
          <label for="skills" class="form-label">
            Fähigkeiten (Komma-getrennt)
          </label>
          <input
            id="skills"
            v-model="skillsInput"
            type="text"
            placeholder="JavaScript, React, Node.js, TypeScript"
            class="input"
          />
          <p class="form-hint">
            Gib die wichtigsten Fähigkeiten des Kandidaten ein, getrennt durch Kommas
          </p>
        </div>

        <!-- Experience -->
        <div class="form-group">
          <label for="experience" class="form-label">
            Berufserfahrung
          </label>
          <textarea
            id="experience"
            v-model="form.experience"
            rows="4"
            placeholder="Beschreibe die relevante Berufserfahrung..."
            class="textarea"
          ></textarea>
        </div>

        <!-- Motivation -->
        <div class="form-group">
          <label for="motivation" class="form-label">
            Warum empfiehlst du diesen Kandidaten? *
          </label>
          <textarea
            id="motivation"
            v-model="form.motivation"
            required
            rows="4"
            placeholder="Erkläre, warum dieser Kandidat gut zum Unternehmen passt..."
            class="textarea"
          ></textarea>
        </div>
      </div>

      <!-- CV Upload -->
      <div class="card">
        <h2 class="heading-2">Lebenslauf (optional)</h2>

        <div class="form-group">
          <label for="cv" class="form-label">
            CV hochladen (PDF, DOCX, max. 5MB)
          </label>
          <input
            id="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            @change="handleFileUpload"
            class="input"
          />
          <p v-if="uploadProgress > 0 && uploadProgress < 100" class="form-hint">
            Upload: {{ uploadProgress }}%
          </p>
          <p v-if="form.cvFileName" class="text-green-400 text-sm mt-2">
            ✓ {{ form.cvFileName }} hochgeladen
          </p>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-4 justify-end">
        <NuxtLink to="/recommendations" class="btn-outline">
          Abbrechen
        </NuxtLink>
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          <span v-if="loading">Wird gespeichert...</span>
          <span v-else>Empfehlung einreichen</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'employee-only']
})

const router = useRouter()

const form = ref({
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  candidateLinkedIn: '',
  position: '',
  department: '',
  skills: [] as string[],
  experience: '',
  motivation: '',
  cvFilePath: '',
  cvFileName: ''
})

const skillsInput = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const uploadProgress = ref(0)

// Convert skills input to array
watch(skillsInput, (value) => {
  if (value) {
    form.value.skills = value.split(',').map(s => s.trim()).filter(s => s)
  } else {
    form.value.skills = []
  }
})

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Datei ist zu groß. Maximal 5MB erlaubt.'
    return
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Nur PDF und DOCX Dateien sind erlaubt.'
    return
  }

  try {
    uploadProgress.value = 0
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<{
      success: boolean
      file: {
        path: string
        filename: string
      }
    }>('/api/upload/cv', {
      method: 'POST',
      body: formData
    })

    if (response.file?.path) {
      form.value.cvFilePath = response.file.path
      form.value.cvFileName = file.name
      uploadProgress.value = 100
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Fehler beim Hochladen der Datei.'
    uploadProgress.value = 0
  }
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/recommendations', {
      method: 'POST',
      body: {
        candidateName: form.value.candidateName,
        candidateEmail: form.value.candidateEmail,
        candidatePhone: form.value.candidatePhone || null,
        candidateLinkedIn: form.value.candidateLinkedIn || null,
        position: form.value.position,
        department: form.value.department,
        skills: form.value.skills,
        experience: form.value.experience || null,
        motivation: form.value.motivation,
        cvFilePath: form.value.cvFilePath || null,
        cvFileName: form.value.cvFileName || null
      }
    })

    if (response.success) {
      success.value = 'Empfehlung erfolgreich eingereicht!'
      
      // Redirect nach 2 Sekunden
      setTimeout(() => {
        router.push('/recommendations')
      }, 2000)
    }
  } catch (err: any) {
    console.error('Submit error:', err)
    error.value = err.data?.message || 'Fehler beim Einreichen der Empfehlung.'
  } finally {
    loading.value = false
  }
}
</script>