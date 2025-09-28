<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-semibold text-gray-900">
            Dashboard
          </h1>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Willkommen, {{ data?.user?.firstName }}!
            </span>
            <UBadge :color="getRoleColor(data?.user?.role)" variant="subtle">
              {{ data?.user?.role }}
            </UBadge>
            <UButton @click="handleLogout" variant="ghost" size="sm">
              Abmelden
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="card">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Willkommen im Dashboard
        </h2>
        <p class="text-gray-600 mb-4">
          Authentifizierung erfolgreich! Du bist eingeloggt als {{ data?.user?.name }}.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <p><strong>E-Mail:</strong> {{ data?.user?.email }}</p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <p><strong>Rolle:</strong> {{ data?.user?.role }}</p>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <p><strong>Abteilung:</strong> {{ data?.user?.department || 'Nicht angegeben' }}</p>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg">
            <p><strong>ID:</strong> {{ data?.user?.id }}</p>
          </div>
        </div>

        <div class="mt-6 p-4 bg-gray-100 rounded-lg">
          <p class="text-sm text-gray-600">
            Dashboard erfolgreich geladen. Das Authentication-System funktioniert!
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const { data, signOut } = useAuth()

async function handleLogout() {
  await signOut()
}

function getRoleColor(role) {
  switch (role) {
    case 'ADMIN': return 'red'
    case 'HR': return 'blue'
    case 'EMPLOYEE': return 'green'
    default: return 'gray'
  }
}
</script>