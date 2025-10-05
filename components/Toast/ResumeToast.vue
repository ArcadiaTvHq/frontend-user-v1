<template>
  <Transition name="resume-toast">
    <div v-show="show" class="resume-toast-container">
      <div class="resume-toast-content">
        <div class="toast-icon">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5v10l6-5-6-5z" />
          </svg>
        </div>
        <div class="toast-message-content">
          <p class="toast-title">Continue Watching?</p>
          <p class="toast-message">
            You were {{ formatTime(lastDuration) }} into this video
          </p>
        </div>
        <button @click="handleResume" class="resume-button">Resume</button>
        <button
          @click="handleDismiss"
          class="dismiss-button"
          aria-label="Dismiss"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  lastDuration: number;
}

interface Emits {
  (e: "resume", time: number): void;
  (e: "dismiss"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const handleResume = () => {
  emit("resume", props.lastDuration);
};

const handleDismiss = () => {
  emit("dismiss");
};
</script>

<style scoped>
.resume-toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
  width: calc(100vw - 2rem);
}

.resume-toast-content {
  background: linear-gradient(
    135deg,
    rgba(22, 22, 22, 0.95),
    rgba(30, 30, 30, 0.95)
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast-icon {
  color: #ffd700;
  display: flex;
  align-items: center;
}

.toast-message-content {
  flex: 1;
  color: white;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
  color: #ffd700;
}

.toast-message {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.resume-button {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resume-button:hover {
  background: linear-gradient(135deg, #ffc107, #ffd700);
  transform: translateY(-1px);
}

.resume-button:active {
  transform: translateY(0);
}

.dismiss-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.dismiss-button:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
}

.resume-toast-enter-active,
.resume-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resume-toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.resume-toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive styles */
@media (max-width: 640px) {
  .resume-toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
    max-width: none;
  }

  .resume-toast-content {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .resume-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
  }
}
</style>
