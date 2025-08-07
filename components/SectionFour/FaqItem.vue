<template>
  <div
    class="border-gold border-2 min-h-25 h-fit bg-[#0B0B0B] flex  items-center   w-full transition-all duration-300 hover:bg-[#CE8F00] gap-4 px-5"
    @click="handleToggle"
  >
    
    
    <img
        class="w-4 h-4 transition-transform duration-300 "
        :style="{ transform: props.isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }"
        src="../../assets/icons/plus.svg"
        alt="Toggle FAQ"
      />
    <div
      class="px-5 py-3 md:px-10 md:py-6 transition-all duration-300 flex flex-col gap-4"
    >
      <p class="text-left text-small md:text-base font-bold">
        {{ props.question }}
      </p>
      <p class="text-smallest  font-inter text-[#F6F6F6]
      " v-show="props.isOpen">
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
