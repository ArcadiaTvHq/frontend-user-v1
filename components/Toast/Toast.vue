<template>
  <Transition name="toast">
    <div v-show="show" :class="['toast-container', type]">
      <div class="toast-content">
        <span class="toast-icon">
          {{ type === "success" ? "✓" : "✕" }}
        </span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  message: string;
  type: "success" | "error";
  duration?: number;
  show: boolean;
}

defineProps<Props>();
</script>

<script lang="ts">
export default {
  name: "Toast",
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  z-index: 1000;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: var(--font-orbitron);
}

.success {
  background-color: #4caf50;
  color: white;
}

.error {
  background-color: #f44336;
  color: white;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
}

.toast-message {
  font-size: 14px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>