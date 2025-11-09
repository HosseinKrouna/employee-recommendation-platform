<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <!-- Icon -->
          <div class="modal-icon" :class="iconClass">
            <svg v-if="type === 'success'" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="type === 'error'" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else-if="type === 'warning'" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="modal-title">{{ title }}</h3>

          <!-- Message -->
          <p class="modal-message">{{ message }}</p>

          <!-- Buttons -->
          <div class="modal-buttons">
            <button
              v-if="showCancel"
              @click="handleCancel"
              class="btn-modal-cancel"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="btn-modal-confirm"
              :class="confirmButtonClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  autoClose?: number 
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: 'OK',
  cancelText: 'Abbrechen',
  showCancel: false,
  autoClose: 0
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

const iconClass = computed(() => {
  const classes = {
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    error: 'bg-red-500/20 text-red-400 border-red-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
  }
  return classes[props.type]
})

const confirmButtonClass = computed(() => {
  const classes = {
    success: 'bg-green-600 hover:bg-green-700 border-green-500',
    error: 'bg-red-600 hover:bg-red-700 border-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 border-blue-500'
  }
  return classes[props.type]
})

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const closeModal = () => {
  if (!props.showCancel) {
    emit('close')
  }
}

// Auto-close wenn aktiviert
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.autoClose > 0) {
    setTimeout(() => {
      emit('close')
    }, props.autoClose)
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center px-4;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

.modal-container {
  @apply relative bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8;
  @apply border border-gray-700;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
}

.modal-icon {
  @apply w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center;
  @apply border-2 animate-bounce-slow;
}

.modal-title {
  @apply text-2xl font-bold text-white text-center mb-3;
}

.modal-message {
  @apply text-gray-300 text-center mb-6 leading-relaxed;
}

.modal-buttons {
  @apply flex gap-3 justify-center;
}

.btn-modal-cancel {
  @apply px-6 py-3 rounded-lg font-semibold transition-all;
  @apply bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600;
}

.btn-modal-confirm {
  @apply px-6 py-3 rounded-lg font-semibold transition-all text-white shadow-lg;
  @apply border;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
</style>