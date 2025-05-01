<template>
  <!-- <Loading/> -->
  <Modal/>
<Navbar/>
<main class="bg-body">
  <SectionOne text="Stream the Best Movies & Series Anytime, Anywhere" small="Enjoy unlimited movies, series, and exclusive content in stunning quality. Stream anytime, anywhere, on any device—no interruptions, just pure entertainment"/>

  <Divider/>
  <SectionTwo/>
  <SectionThree/>
  <SectionFour/>
  <SectionLast/> 
</main>
</template>


<style>
  .btn:hover{
    animation: hover-state 0.5s linear forwards
  }

  @keyframes hover-state{
    to{
      transform: scale(1.1);
      background-color: var(--color-hover);
      
    }
  }
</style>