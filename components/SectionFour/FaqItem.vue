<template>
  <div
    class="bg-darkgray rounded-[8px] md:max-w-[624px] w-full transition-all duration-300 hover:scale-[1.02]"
  >
    <button
      type="button"
      @click="handleToggle"
      class="bg-[#FFD005] w-full h-16 md:h-20 flex items-center justify-between rounded-[8px] px-5 md:px-10 cursor-pointer hover:bg-[#CE8F00] text-black transition-all duration-300 font-orbitron"
    >
      <p class="text-left text-small md:text-base font-bold">
        {{ props.question }}
      </p>
      <img
        class="w-3 h-2 transition-transform duration-300 brightness-0"
        :style="{ transform: props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
        src="../../assets/chevron.png"
        alt="Toggle FAQ"
      />
    </button>
    <div
      v-show="props.isOpen"
      class="px-5 py-3 md:px-10 md:py-6 transition-all duration-300"
    >
      <p class="text-smallest md:text-normal font-orbitron">
        {{ props.answer }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  question: string;
  answer: string;
  isOpen: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  question: "",
  answer: "",
  isOpen: false,
});

const emit = defineEmits(["update:isOpen"]);

const handleToggle = () => {
  emit("update:isOpen", !props.isOpen);
};
</script>

<style scoped>
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
