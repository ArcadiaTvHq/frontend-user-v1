<template>
  <Navbar/>
  <main class="bg-black h-full">
    <div class=" bg-[url(../../assets/images/Picture.png)] h-[90vh] bg-cover font-martel md:bg-center">
      <div class="absolute h-[90vh] w-[98vw] z-5 flex justify-center items-center opacity-70 bg-black"></div>
      <div class="flex flex-col justify-center items-center absolute h-full w-full z-6">
        <div class=" flex items-center  text-white  w-4/5  gap-6">
          <img src="../../assets/images/preview.png">
          <div class="flex flex-col gap-4">
            <h1 class="font-bold text-medium">The Crown <span class="font-normal text-small">2016-2023</span></h1> 
            <p class="text-small text-[#D2D2D2] font-inter">Genre: Historical drama</p>
            <p class="text-small text-[#D2D2D2] font-inter">Time: 58m</p>
            <p class="text-small text-[#D2D2D2] font-inter">Stars: Claire Foy, Olivia Colman, Matt Smith, Tobias Menzies</p>
            <p class="text-small text-[#D2D2D2] font-inter">Created by: Peter Morgan</p>
            <p class="bg-gold rounded-[8px] h-[29px] w-16 text-center text-black">5.0</p>
            <p class="font-inter text-small text-[#D2D2D2] ">After the king's sudden death, Elizabeth's seemingly quiet life is rattled with personal trials and tribulations and the affairs of the state as she succeeds to the throne of the British monarchy.</p>
            <div class="flex gap-5 ">
              <button class="bg-gold h-12 w-33 rounded-[15px] flex gap-1 items-center justify-center btn text-black px-6">
                <p>Watch</p>
                <IconsPlayicon/>
              </button>
              <button class="bg-black border-1 border-gold h-12 rounded-[15px] px-2 px-6">
                <p>Add to List</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    <Comment/>
    <SectionTwo/>
    <HomeFoot/>

  </main>
</template>