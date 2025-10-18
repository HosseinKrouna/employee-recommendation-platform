<template>
  <div class="min-h-screen bg-gray-900 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <!-- Logo/Brand - Kompakt -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🚀</span>
          <div>
            <h1 class="text-lg font-bold text-white">ERP</h1>
            <p class="text-xs text-muted">Referral Platform</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2">
        <!-- Nur für normale Mitarbeiter -->
        <template v-if="!isHR">
          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/dashboard' }"
          >
            <span class="text-xl">📊</span>
            <span>Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/recommendations"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path.startsWith('/recommendations') && $route.path !== '/recommendations/new' }"
          >
            <span class="text-xl">📋</span>
            <span>Meine Empfehlungen</span>
          </NuxtLink>

          <NuxtLink
            to="/recommendations/new"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/recommendations/new' }"
          >
            <span class="text-xl">➕</span>
            <span>Neue Empfehlung</span>
          </NuxtLink>
        </template>

        <!-- Nur für HR -->
        <template v-if="isHR">
          <NuxtLink
            to="/hr/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/hr/dashboard' }"
          >
            <span class="text-xl">📊</span>
            <span>Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/hr/review"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/hr/review' }"
          >
            <span class="text-xl">✅</span>
            <span>Prüfung</span>
          </NuxtLink>

          <NuxtLink
            to="/hr/analytics"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/hr/analytics' }"
          >
            <span class="text-xl">📈</span>
            <span>Analytics</span>
          </NuxtLink>
        </template>

        <div class="divider my-4"></div>

        <NuxtLink
          to="/profile"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/profile' }"
        >
          <span class="text-xl">👤</span>
          <span>Profil</span>
        </NuxtLink>

        <NuxtLink
          to="/settings"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          :class="{ 'bg-indigo-600 text-white shadow-lg': $route.path === '/settings' }"
        >
          <span class="text-xl">⚙️</span>
          <span>Einstellungen</span>
        </NuxtLink>
      </nav>

      <!-- Stats/Info am unteren Rand -->
      <div class="p-4 border-t border-gray-700">
        <div class="card p-3 bg-gray-900">
          <p class="text-xs text-muted mb-2">Deine Statistik</p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-secondary">Empfehlungen:</span>
            <span class="text-primary font-bold">{{ totalRecommendations }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Header -->
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="flex items-center justify-end">
          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="relative p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <span class="text-2xl">🔔</span>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- User Dropdown -->
            <div class="relative">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {{ userInitials }}
                </div>
                <!-- User Info -->
                <div class="text-left hidden md:block">
                  <p class="text-sm font-medium text-white">{{ userName }}</p>
                  <p class="text-xs text-muted">{{ userDepartment }}</p>
                </div>
                <!-- Dropdown Icon -->
                <span class="text-gray-400">▼</span>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-56 card py-2 z-50"
              >
                <NuxtLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-secondary hover:bg-gray-700 transition-colors"
                  @click="userMenuOpen = false"
                >
                  👤 Profil anzeigen
                </NuxtLink>
                <NuxtLink
                  to="/settings"
                  class="block px-4 py-2 text-sm text-secondary hover:bg-gray-700 transition-colors"
                  @click="userMenuOpen = false"
                >
                  ⚙️ Einstellungen
                </NuxtLink>
                <div class="divider my-2"></div>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  🚪 Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between text-sm text-muted">
          <p>© 2024 Employee Recommendation Platform</p>
          <div class="flex gap-4">
            <a href="#" class="hover:text-indigo-400 transition-colors">Hilfe</a>
            <a href="#" class="hover:text-indigo-400 transition-colors">Datenschutz</a>
            <a href="#" class="hover:text-indigo-400 transition-colors">Impressum</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  department: string | null
}

interface AuthData {
  user: User | null
}

const { data, signOut } = useAuth()
const router = useRouter()
const route = useRoute()

const userMenuOpen = ref(false)
const totalRecommendations = ref(0)

// User-Daten
const userName = computed(() => {
  const authData = data.value as AuthData
  const user = authData?.user
  return user ? `${user.firstName} ${user.lastName}` : 'User'
})

const userInitials = computed(() => {
  const authData = data.value as AuthData
  const user = authData?.user
  if (!user) return 'U'
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
})

const userDepartment = computed(() => {
  const authData = data.value as AuthData
  return authData?.user?.department || 'Keine Abteilung'
})

const isHR = computed(() => {
  const authData = data.value as AuthData
  const department = authData?.user?.department
  return department === 'HR' || department === 'Human Resources'
})

// Logout Handler
const handleLogout = async () => {
  userMenuOpen.value = false
  await signOut()
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      userMenuOpen.value = false
    }
  })

  // Load total recommendations
  loadStats()
})

const loadStats = async () => {
  try {
    const { data } = await useFetch('/api/recommendations')
    if (data.value) {
      const recs = Array.isArray(data.value) ? data.value : data.value.recommendations || []
      totalRecommendations.value = recs.length
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}
</script>