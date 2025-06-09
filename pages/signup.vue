<script setup>
import { useVuelidate } from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import Toast from "~/components/Toast/Toast.vue";
import { useAuthStore } from "~/stores/auth";
import CloseIcon from "~/components/CloseIcon/CloseIcon.vue";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();

const error = ref(null);

const formData = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  keepSignedIn: false,
});

const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  password: { required, minLength: minLength(8) },
  confirmPassword: {
    required,
    sameAsPassword: (value) =>
      value === formData.password || "Passwords must match",
  },
};

const v$ = useVuelidate(rules, formData, { $autoDirty: true });

// Watch password changes to trigger confirmPassword validation
watch(
  () => formData.password,
  () => {
    if (formData.confirmPassword) {
      v$.value.confirmPassword.$touch();
    }
  }
);

const loading = computed(() => authStore.loading);
// const error = computed(() => authStore.error);
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

  try {
    const response = await authStore.register({
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
    });

    // Show success toast with response message
    toastMessage.value = response?.message || "Account created successfully!";
    toastType.value = "success";
    showToast.value = true;

    // Always navigate to OTP page after signup since user needs to verify
    setTimeout(() => {
      navigateTo("/otp");
    }, 1000);
  } catch (e) {
    // Show error toast with response message
    toastMessage.value =
      e?.response?.data?.message ||
      "Failed to create account. Please try again.";
    toastType.value = "error";
    showToast.value = true;
    error.value = e?.response?.data?.message;
  } finally {
    // Clear form if needed
    if (!error.value) {
      formData.firstName = "";
      formData.lastName = "";
      formData.email = "";
      formData.password = "";
      formData.confirmPassword = "";
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
        Sign up to a new account
      </h1>

      <div class="flex flex-col md:flex-row font-orbitron gap-4 w-full">
        <div class="flex flex-col gap-2 w-full">
          <label class="block text-sm">First Name</label>
          <input
            v-model="formData.firstName"
            class="w-full h-13 border border-inputb rounded-[8px] p-4 font-inter bg-[#1e1e1e] text-white"
            :class="{ 'border-red-500': v$.firstName.$error }"
            placeholder="John"
            type="text"
          />
          <span v-if="v$.firstName.$error" class="text-red-500 text-xs mt-1">
            First name is required
          </span>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <label class="block text-sm">Last Name</label>
          <input
            v-model="formData.lastName"
            class="w-full h-13 border border-inputb rounded-[8px] p-4 font-inter bg-[#1e1e1e] text-white"
            :class="{ 'border-red-500': v$.lastName.$error }"
            placeholder="Doe"
            type="text"
          />
          <span v-if="v$.lastName.$error" class="text-red-500 text-xs mt-1">
            Last name is required
          </span>
        </div>
      </div>

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
        <label class="block text-sm">Create Password</label>
        <input
          v-model="formData.password"
          class="w-full h-13 border border-inputb rounded-[8px] p-4 font-inter bg-[#1e1e1e] text-white"
          :class="{ 'border-red-500': v$.password.$error }"
          type="password"
          placeholder="........"
        />
        <span v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
          Password must be at least 8 characters
        </span>
      </div>

      <div class="flex flex-col font-orbitron gap-2 w-full">
        <label class="block text-sm">Confirm Password</label>
        <input
          v-model="formData.confirmPassword"
          class="w-full h-13 border border-inputb rounded-[8px] p-4 font-inter bg-[#1e1e1e] text-white"
          :class="{ 'border-red-500': v$.confirmPassword.$error }"
          type="password"
          placeholder="........"
        />
        <span
          v-if="v$.confirmPassword.$error"
          class="text-red-500 text-xs mt-1"
        >
          {{
            v$.confirmPassword.required.$message ||
            v$.confirmPassword.sameAsPassword.$message
          }}
        </span>
      </div>

      <!-- <div class="flex gap-4 items-center w-full">
        <input
          v-model="formData.keepSignedIn"
          class="w-4 h-4 bg-[#1E1E1E] border border-inputb accent-gold cursor-pointer"
          type="checkbox"
        />
        <p class="font-inter text-type text-sm">Keep me signed in</p>
      </div> -->

      <p class="text-type font-inter text-sm text-white/80">
        By clicking "Continue," you acknowledge that you have read and accept
        our Privacy Policy & Subscriber Agreement.
      </p>

      <span v-if="error" class="text-red-500 text-sm">{{ error }}</span>

      <div class="flex flex-col items-center w-full gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="h-13 w-full max-w-[280px] bg-[#FFD005] text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer hover:bg-[#CE8F00] disabled:bg-[#FFF487] transition-all duration-300"
        >
          {{ loading ? "Loading..." : "Continue" }}
        </button>
        <span class="font-inter text-sm">
          Already have an account?
          <nuxt-link
            to="/login"
            class="text-[#FFD005] hover:text-[#CE8F00] underline cursor-pointer transition-colors ml-1"
          >
            Sign in
          </nuxt-link>
        </span>
      </div>
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
