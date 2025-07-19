<template>
  <section class="relative h-screen">
    <!-- Background with overlay -->
    <div
      class="absolute inset-0 bg-[url(../../assets/images/Picture.png)] bg-cover bg-center"
    >
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
      ></div>
    </div>

    <!-- Main content -->
    <div
      class="relative h-full flex items-center translate-y-[15%] justify-center"
    >
      <!-- Side Movies - Desktop Only (Acting as Navigation) -->
      <div
        class="hidden lg:flex absolute left-[2%] xl:left-[5%] translate-y-[15%]"
      >
        <button class="relative group cursor-pointer focus:outline-none">
          <img
            src="../../assets/images/left.png"
            alt="Previous Movie"
            class="w-36 rounded-lg shadow-2xl opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <div
            class="absolute inset-0 bg-black/30 group-hover:bg-black/50 rounded-lg transition-all"
          ></div>
        </button>
      </div>
      <div
        class="hidden lg:flex absolute right-[2%] xl:right-[5%] translate-y-[15%]"
      >
        <button class="relative group cursor-pointer focus:outline-none">
          <img
            src="../../assets/images/right.png"
            alt="Next Movie"
            class="w-36 rounded-lg shadow-2xl opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <div
            class="absolute inset-0 bg-black/30 group-hover:bg-black/50 rounded-lg transition-all"
          ></div>
        </button>
      </div>

      <!-- Central Content -->
      <div
        class="flex flex-col items-center max-w-4xl w-full text-white text-center px-4 sm:px-6 md:px-8"
      >
        <!-- Mobile/Tablet Navigation Arrows -->
        <div class="flex lg:hidden justify-between w-full mb-6">
          <button
            class="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all flex items-center justify-center"
          >
            <div class="w-8 h-8 flex items-center justify-center">
              <img
                src="../../assets/icons/chevron.svg"
                alt="Previous"
                class="w-6 h-6 rotate-90 text-white [&>path]:stroke-white"
              />
            </div>
          </button>
          <button
            class="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all flex items-center justify-center"
          >
            <div class="w-8 h-8 flex items-center justify-center">
              <img
                src="../../assets/icons/chevron.svg"
                alt="Next"
                class="w-6 h-6 -rotate-90 text-white [&>path]:stroke-white"
              />
            </div>
          </button>
        </div>

        <h1
          class="font-martel font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-3 md:mb-4"
        >
          The Crown
        </h1>
        <p
          class="font-inter text-sm md:text-base lg:text-lg max-w-xl mx-auto mb-6 md:mb-8 opacity-90 leading-relaxed"
        >
          After the king's sudden death, Elizabeth's seemingly quiet life is
          rattled with personal trials and tribulations and the affairs of the
          state as she succeeds to the throne of the British monarchy.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300"
          >
            <span>Watch</span>
            <img src="../../assets/icons/play.svg" alt="Play" class="w-5 h-5" />
          </button>
          <button
            class="border-2 border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-12 px-10 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>Add to List</span>
            <img
              src="../../assets/icons/plus.svg"
              alt="add"
              class="w-5 h-5 group-hover:brightness-0"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>



<style scoped>
.bg-gradient-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    transparent 100%
  );
}
</style>