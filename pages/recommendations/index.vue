<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Meine Empfehlungen</h1>
        <UButton @click="navigateTo('/recommendations/create')" icon="i-heroicons-plus">
          Neue Empfehlung
        </UButton>
      </div>

      <RecommendationList
        :recommendations="recommendations"
        :loading="loading"
        empty-message="Sie haben noch keine Empfehlungen eingereicht."
        @view="handleView"
      />
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
const recommendations = ref([])

const fetchRecommendations = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/recommendations')
    recommendations.value = response.recommendations
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  } finally {
    loading.value = false
  }
}

const handleView = (recommendation) => {
  console.log('View recommendation:', recommendation)
  // TODO: Navigieren zu einer Detailsseite oder Modal
}

onMounted(() => {
  fetchRecommendations()
})
</script>