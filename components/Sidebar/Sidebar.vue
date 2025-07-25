<template>
  <div class=" flex flex-col px-[24px] pt-[40px] text-white bg-[#0105114D] gap-7">
    <input class="max-w-64 h-11 bg-body border-borderinput border-[1px] rounded-[4px]" />
    <div>
      <button >
        <div class="flex flex-col gap-1">
          <button class="flex items-center gap-3 h-10" v-for="i in btns" :key="i">
            <component :is="i.left" />
            <p>{{ i.right }}</p>
          </button>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>

import { IconsAdverisementicon, IconsContenticon, IconsDashboardicon, IconsUsersicon, LazyIconsDashboardicon, } from '#components';



  const btns = 
  [
    {left: IconsDashboardicon, right:'Dashboard' },
    {left: IconsContenticon, right:'Content' },
    {left: IconsAdverisementicon, right:'Advertisement' },
    {left: IconsUsersicon, right:'Users' }

  ]

</script>