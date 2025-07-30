<template>
  <div>
    <section
      class="bg-body bg-[url(../../assets/signup/bg.png)] bg-cover min-h-[100vh] w-full text-white flex items-end md:items-center justify-center bg-blend-overlay"
    >
      <!-- <Toast
    /> -->
      <form
        class="bg-body w-full max-w-[560px] flex flex-col gap-6 rounded-t-[18px] md:rounded-[18px] border border-minputb md:border-inputb px-6 md:px-10 py-8 justify-center items-center relative"
      >
        <button
          class="absolute top-4 right-4 text-white hover:text-red-500 transition-colors duration-300 focus:outline-none"
          type="button"
        >
          <CloseIcon class="w-6 h-6" />
        </button>
        <div class="flex justify-center">
          <img
            class="w-[60px] h-[60px] object-contain"
            src="@/assets/logo2.png"
            alt="Logo"
          />
        </div>
        <h1 class="font-orbitron text-2xl md:text-3xl text-center">
          Sign in to your account
        </h1>

        <div class="flex flex-col font-orbitron gap-2 w-full">
          <label class="block text-sm">Email</label>
          <input
            class="w-full h-13 border border-inputb rounded-[8px] p-4 font-orbitron bg-[#1e1e1e] text-white"
            placeholder="john.doe@gmail.com"
            type="email"
          />
          <!-- <span v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
          {{ v$.email.$errors[0].$message }}
        </span> -->
        </div>

        <div class="flex flex-col font-orbitron gap-2 w-full">
          <label class="block text-sm">Password</label>
          <input
            class="w-full h-13 border border-inputb rounded-[8px] p-4 font-orbitron bg-[#1e1e1e] text-white"
            type="password"
            placeholder="........"
          />
          <!-- <span v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
          {{ v$.password.$errors[0].$message }}
        </span> -->
        </div>
        <div class="flex gap-4 items-center w-full">
          <input
            class="w-4 h-4 bg-[#1E1E1E] border border-inputb accent-gold"
            type="checkbox"
          />
          <p class="font-orbitron text-type text-sm">Keep me signed in</p>
        </div>

        <div
          class="flex flex-col items-center w-full gap-3 border-b border-b-white/30 pb-5"
        >
          <button
            type="submit"
            class="h-13 w-full max-w-[280px] bg-[#FFD005] text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer hover:bg-[#CE8F00] disabled:bg-[#FFF487] transition-all duration-300"
          >
            <!-- {{ loading ? "Loading..." : "Login" }} -->
          </button>
          <nuxt-link
            to="/forgot"
            class="text-sm font-orbitron cursor-pointer text-white hover:text-[#CE8F00] transition-colors"
            >Forgot Password?</nuxt-link
          >
        </div>

        <!-- <span v-if="error" class="text-red-500 text-sm">{{ error }}</span> -->

        <span class="font-orbitron text-sm">
          Don't have an account?
          <nuxt-link
            to="/signup"
            class="text-[#FFD005] hover:text-[#CE8F00] underline cursor-pointer transition-colors ml-1"
          >
            Sign up
          </nuxt-link>
        </span>
      </form>
    </section>
  </div>
</template>