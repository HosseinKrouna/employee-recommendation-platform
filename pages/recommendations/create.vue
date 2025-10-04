<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-6">
        <UButton @click="navigateTo('/dashboard')" variant="ghost" icon="i-heroicons-arrow-left">
          Zurück zum Dashboard
        </UButton>
      </div>

      <FormsRecommendationForm @submitted="handleSubmitted" />
    </div>
  </div>
</template>

<script setup>
const handleSubmitted = (recommendation) => {
  console.log('Empfehlung eingereicht:', recommendation)
}
</script>