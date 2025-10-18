<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Background Pattern -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-gray-900 to-purple-500/10"></div>
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.1) 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <slot />
    </div>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 py-6 text-center bg-gradient-to-t from-gray-900 to-transparent">
      <p class="text-muted text-sm">
        © 2025 Employee Recommendation Platform. Alle Rechte vorbehalten.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Auth Layout für Login/Register Pages
// Minimalistisches Design ohne Navigation
</script>