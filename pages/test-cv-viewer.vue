<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">CV Viewer Test</h1>
    
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Select Recommendation:</label>
      <select v-model="selectedId" class="border rounded px-3 py-2 w-full">
        <option value="">-- Select --</option>
        <option v-for="rec in recommendations" :key="rec.id" :value="rec.id">
          {{ rec.candidateName }} ({{ rec.cvFilePath ? '✅ Has CV' : '❌ No CV' }})
        </option>
      </select>
    </div>

    <div v-if="selectedRecommendation" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">{{ selectedRecommendation.candidateName }}</h2>
      <CvViewer
        :recommendation-id="selectedRecommendation.id"
        :candidate-name="selectedRecommendation.candidateName"
        :cv-path="selectedRecommendation.cvFilePath"
      />
    </div>
  </div>
</template>

<script setup>

import CvViewer from '~/components/CvViewer.vue'

const selectedId = ref('')
const recommendations = ref([])

const selectedRecommendation = computed(() => {
  return recommendations.value.find(r => r.id === selectedId.value)
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  const response = await fetch('/api/recommendations', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  recommendations.value = data.recommendations
})
</script>