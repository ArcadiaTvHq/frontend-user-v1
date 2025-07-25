<template>
  <section class="flex flex-col text-white items-center gap-8 mt-28 px-[104px]">
    <div class="flex justify-between w-full">
      <div class="gap-2 flex">
        <IconsCommenticon/>
        <p>Comments</p>
      </div>
      <div class="flex gap-3">
        <button class="bg-gold h-13 rounded-[20px] w-37 justify-center items-center flex px-5 text-black btn gap-3 ">
        <p>Add Review</p>
        <IconsAdd/>
      </button>
      <button class="bg-[#1A1A1ACC] h-13 rounded-[20px] w-37 justify-center items-center flex px-5 btn gap-3">
        <p>Latest</p>
        <IconsDown color="#ffffff"/>
      </button>
      </div>

    </div>
    <div class="grid grid-cols-2 gap-5 ">
      <CommentCard v-for="i in 4" :key="i" ratings="4"/>
    </div>
    <button class="flex bg-gold text-black w-41 rounded-[10px] justify-center h-11  items-center px-5 gap-3 btn "><p>See More </p><IconsDown/></button>
  </section>
</template>