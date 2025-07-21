<template>
  <section class="grid grid-row-3 gap-20 ">
    <Navbar/>
    <div class="grid grid-cols-3 grid-flow-col gap-11 px-15 h-[700px] items-center">
      <ProfileSide class="flex h-full" />
      <div class="grid col-span-2 w-full">
        <ProfileMain/>
      </div>
    </div>
    <HomeFoot class="mt-auto"/>
  </section>
</template>