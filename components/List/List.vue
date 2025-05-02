<template>
  <div class="flex gap-1 md:gap-4 font-inter">
    <Checked class="size-7" v-if=props.ischecked />
    <Cross class="size-7" v-else/>
    <p class="text-tiny md:text-small text-gold" v-if="ischecked">{{ benefit }}</p>
    <p class="text-tiny md:text-small" v-else>{{ benefit }}</p>
  </div>
</template>

<script setup>
const props = defineProps(['benefit', 'ischecked'])

</script>