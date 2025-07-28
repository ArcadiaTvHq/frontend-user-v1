<template>
  <Navbar />
  <main class="bg-black h-full">
    <div
      class="bg-[url(../../assets/images/Picture.png)] h-[90vh] bg-cover font-orbitron md:bg-center"
    >
      <div
        class="absolute h-[90vh] w-[98vw] z-5 flex justify-center items-center opacity-70 bg-black"
      ></div>
      <div class="flex flex-col justify-end h-full text-white p-8 md:p-12">
        <div class="max-w-2xl">
          <h1 class="font-bold text-medium">
            The Crown <span class="font-normal text-small">2016-2023</span>
          </h1>
          <p class="text-small text-[#D2D2D2] font-orbitron">
            Genre: Historical drama
          </p>
          <p class="text-small text-[#D2D2D2] font-orbitron">Time: 58m</p>
          <p class="text-small text-[#D2D2D2] font-orbitron">
            Stars: Claire Foy, Olivia Colman, Matt Smith, Tobias Menzies
          </p>
          <p class="text-small text-[#D2D2D2] font-orbitron">
            Created by: Peter Morgan
          </p>
          <div class="mt-4">
            <p class="font-orbitron text-small text-[#D2D2D2]">
              After the king's sudden death, Elizabeth's seemingly quiet life is
              rattled with personal trials and tribulations and the affairs of
              the state as she succeeds to the throne.
            </p>
          </div>
        </div>
      </div>
    </div>
    <Comment />
    <SectionTwo />
    <HomeFoot />
  </main>
</template>