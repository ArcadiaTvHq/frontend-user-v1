<template>
  <div class="bg-darkgray rounded-[8px] md:w-[624px]">
    <button
      @click="handleToggle"
      class="bg-darkgold w-full h-13 flex items-center justify-between rounded-[8px] px-5 md:px-10 md:py-8 cursor-pointer btn"
    >
      <p class="text-left text-smallest md:text-normal">
        Pellentesque ac bibendum tortor?
      </p>
      <img
        class="w-3 h-2 icon"
        src="../../assets/chevron.png"
        alt="Toggle icon"
      />
    </button>
    <div v-if="usetoggle" class="px-5 py-3 md:px-10 md:py-6">
      <p class="text-smallest md:text-normal">
        Vivamus sit amet interdum elit. Proin lacinia erat ac velit tempus
        auctor.
      </p>
    </div>
  </div>
</template>

<style scoped>
.rotate {
  animation: rotate 0.5s linear forwards;
}

@keyframes rotate {
  to {
    transform: rotate(-180deg);
  }
}

.rotate-reverse {
  animation: rotate-reverse 0.5s reverse backwards;
}

@keyframes rotate-reverse {
  to {
    transform: rotate(-180deg);
  }
}
</style>

<script setup lang="ts">
import { onMounted } from "vue";
import { toggleFaq } from "../composables/states";

const usetoggle = toggleFaq();

const handleToggle = () => {
  usetoggle.value = !usetoggle.value;
  const icon = document.querySelector(".icon") as HTMLElement;

  if (usetoggle.value) {
    icon.classList.add("rotate");
    icon.classList.remove("rotate-reverse");
  } else {
    icon.classList.remove("rotate");
    icon.classList.add("rotate-reverse");
  }
};
</script>