<script setup>
import searchicon from '../icons/searchicon.vue';
  const pathname = useRequestURL()
  const Links = [
    {name: 'HOME', pathname: '/home' },
    {name: 'TV SHOW', pathname: '/home' },
    {name: 'MOVIES', pathname: '/home' },
    {name: 'NEW', pathname: '/home' }
  ]
  
</script>
<template>
  <nav v-if="pathname.pathname =='/waitlist'"  class="bg-cod border-[0.22px] md:border-[0.4px] border-gold pl-[30.11px] md:pl-14 md:border-[0.4]">
    <img class="max-w-[206px]" src="../../assets/arcadia.png"/>
  </nav>
  <nav v-else  class="bg-cod border-[0.22px] h-23  flex items-center border-gold px-[30.11px] md:px-14 md:border-[0.4px] font-orbitron justify-between">
    <img class="max-w-[206px]" src="../../assets/arcadia.png"/>
    <div class="flex gap-12 ml-38">
      <nuxt-link v-for="(i, index) in Links" :key="index" :to=i.pathname class="text-small font-bold text-link">
        {{ i.name }}
      </nuxt-link>
    </div>
    <div class="flex border-gold border-1 rounded-[21px] h-12 px-5 items-center max-w-72 mx-13"><input placeholder="Search" class="text-white w-9/10"/>
    <searchicon/>
    </div>
    <div class="flex items-center gap-10 ml-3">
      <IconsNotificationIcon/>
      <img src="../../assets//images/avatar.png" class="size-15 rounded-full">
    </div>
  </nav>
</template>