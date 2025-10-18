<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Back Button -->
      <div class="mb-6">
        <button 
          @click="navigateTo('/dashboard')" 
          class="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all font-medium border border-gray-600 group"
        >
          <svg class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück zum Dashboard
        </button>
      </div>

      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-white mb-3">Neue Empfehlung erstellen</h1>
        <p class="text-gray-400 text-lg">Empfehle einen qualifizierten Kandidaten für eine offene Position</p>
      </div>

      <!-- Form Card -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 p-8">
        <FormsRecommendationForm @submitted="handleSubmitted" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['recommendations']
})

const handleSubmitted = (recommendation) => {
  console.log('Empfehlung eingereicht:', recommendation)
  setTimeout(() => navigateTo('/recommendations'), 2000)
}
</script>