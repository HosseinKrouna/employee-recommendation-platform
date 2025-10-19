<template>
  <div class="page-container">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="heading-1">Neue Empfehlung</h1>
          <p class="text-muted">Empfehle einen Kandidaten für eine offene Position</p>
        </div>
        <NuxtLink to="/dashboard" class="btn-outline">
          ← Zurück
        </NuxtLink>
      </div>
    </div>

    <div class="card">
      <FormsRecommendationForm @submitted="handleSubmitted" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'employee-only']
})

const router = useRouter()

const handleSubmitted = () => {
  // Nach erfolgreicher Einreichung zum Dashboard
  setTimeout(() => {
    router.push('/dashboard')
  }, 2000)
}
</script>