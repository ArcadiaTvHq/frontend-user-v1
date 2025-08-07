<template>
  <div
    class="bg-cardgray p-4 md:px-6 md:py-4 text-white rounded-[5px] flex flex-col h-full w-full max-w-[280px]"
  >
    <div class="flex items-center gap-2 mb-3">
      <Logo class="w-5 h-5 md:w-6 md:h-6" v-if="cross" />
      <img class="w-5 h-5 md:w-6 md:h-6" :src="logo" v-else />
      <p :class="typeclass">{{ type }}</p>
    </div>
    <h6 :class="priceStyling">
      {{ price }}
      <span class="text-xs md:text-smallest opacity-75">/month</span>
    </h6>
    <button
      :class="[
        button,
        'transition-all duration-300 hover:bg-[#CE8F00] disabled:bg-[#FFF487] font-orbitron font-extrabold px-6 py-3',
      ]"
    >
      Select this plan
    </button>
    <div class="flex-1 flex flex-col gap-2">
      <List
        v-for="(benefit, index) in benefits"
        :key="index"
        class="mb-1 md:mb-2"
        :benefit="benefit.text"
        :ischecked="benefit.included"
      />
    </div>
  </div>
</template>

<style scoped>
.scale {
  transition: transform 0.3s ease;
}

.scale:hover {
  transform: scale(1.05);
}

@media (max-width: 1024px) {
  .scale:hover {
    transform: scale(1.02);
  }
}
</style>

<script setup>
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  logo: {
    type: [String, Object],
    required: true,
  },
  color: String,
  priceStyling: {
    type: String,
    required: true,
  },
  button: {
    type: String,
    required: true,
  },
  benefits: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      return value.every(
        (benefit) =>
          typeof benefit === "object" &&
          "text" in benefit &&
          "included" in benefit
      );
    },
  },
  typeclass: {
    type: String,
    required: true,
  },
});
</script>
