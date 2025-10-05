<template>
  <Teleport to="body">
    <div class="toast-container-wrapper">
      <TransitionGroup name="toast" tag="div">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          :show="true"
          @click="removeToast(toast.id)"
          class="toast-item"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from "~/composables/useToast";
import Toast from "./Toast.vue";

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  margin-bottom: 10px;
  cursor: pointer;
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

.toast-move {
  transition: transform 0.3s ease;
}
</style>
