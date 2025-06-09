<script setup>
import { useVuelidate } from "@vuelidate/core";
import { required, email, minLength } from "@vuelidate/validators";
import Toast from "~/components/Toast/Toast.vue";
import { useAuthStore } from "~/stores/auth";
import CloseIcon from "~/components/CloseIcon/CloseIcon.vue";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();

const formData = reactive({
  email: "",
  password: "",
  keepSignedIn: false,
});

const rules = {
  email: { required, email },
  password: { required, minLength: minLength(8) },
};

const v$ = useVuelidate(rules, formData);

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("error");

const handleClose = () => {
  navigateTo("/");
};

async function handleSubmit() {
  const result = await v$.value.$validate();

  if (!result) {
    return;
  }

  if (!formData.email || !formData.password) {
    error.value = "Please fill in all fields";
    return;
  }

  loading.value = true;
  try {
    const response = await authStore.login(formData.email, formData.password);

    // Show success toast
    toastMessage.value = response?.message || "Login successful!";
    toastType.value = "success";
    showToast.value = true;

    // Navigate based on verification status
    setTimeout(() => {
      if (!authStore.isVerified) {
        navigateTo("/otp");
      } else {
        navigateTo("/watch");
      }
    }, 1000);
  } catch (e) {
    // Show error toast with response message
    toastMessage.value =
      e?.response?.data?.message || "Invalid email or password";
    toastType.value = "error";
    showToast.value = true;
  } finally {
    // Clear form if needed
    if (!error.value) {
      formData.email = "";
      formData.password = "";
      formData.keepSignedIn = false;
    }
    // Reset toast after duration
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }
}
</script>

<template>
  <section
    class="bg-body bg-[url(../../assets/signup/bg.png)] bg-cover min-h-[100vh] w-full text-white flex items-end md:items-center justify-center bg-blend-overlay"
  >
    <Toast
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />
    <form
      @submit.prevent="handleSubmit"
      class="bg-body w-full max-w-[560px] flex flex-col gap-6 rounded-t-[18px] md:rounded-[18px] border border-minputb md:border-inputb px-6 md:px-10 py-8 justify-center items-center relative"
    >
      <button
        @click="handleClose"
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
          v-model="formData.email"
          class="w-full h-13 border border-inputb rounded-[8px] p-4 font-inter bg-[#1e1e1e] text-white"
          :class="{ 'border-red-500': v$.email.$error }"
          placeholder="john.doe@gmail.com"
          type="email"
        />
        <span v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
          {{ v$.email.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col font-orbitron gap-2 w-full">
        <label class="block text-sm">Password</label>
        <input
          v-model="formData.password"
          class="w-full h-13 border border-inputb rounded-[8px] p-4 font-inter bg-[#1e1e1e] text-white"
          :class="{ 'border-red-500': v$.password.$error }"
          type="password"
          placeholder="........"
        />
        <span v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
          {{ v$.password.$errors[0].$message }}
        </span>
      </div>
      <div class="flex gap-4 items-center w-full">
        <input
          v-model="formData.keepSignedIn"
          class="w-4 h-4 bg-[#1E1E1E] border border-inputb accent-gold"
          type="checkbox"
        />
        <p class="font-inter text-type text-sm">Keep me signed in</p>
      </div>

      <div
        class="flex flex-col items-center w-full gap-3 border-b border-b-white/30 pb-5"
      >
        <button
          type="submit"
          :disabled="loading"
          class="h-13 w-full max-w-[280px] bg-[#FFD005] text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer hover:bg-[#CE8F00] disabled:bg-[#FFF487] transition-all duration-300"
        >
          {{ loading ? "Loading..." : "Login" }}
        </button>
        <a
          class="text-sm font-orbitron cursor-pointer text-white hover:text-[#CE8F00] transition-colors"
          >Forgot Password?</a
        >
      </div>

      <span v-if="error" class="text-red-500 text-sm">{{ error }}</span>

      <span class="font-inter text-sm">
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
</template>

<style scoped>
input[type="checkbox"] {
  cursor: pointer;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Handle Webkit (Chrome, Safari, Edge) autofill */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #1e1e1e inset !important;
  -webkit-text-fill-color: white !important;
  caret-color: white !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Handle Firefox autofill */
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  box-shadow: 0 0 0 30px #1e1e1e inset !important;
  -webkit-text-fill-color: white !important;
  caret-color: white !important;
}
</style>