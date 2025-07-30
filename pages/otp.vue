<template>
  <section
    class="bg-body bg-[url(../../assets/signup/bg.png)] bg-cover min-h-[100vh] w-full text-white flex items-end md:items-center justify-center bg-blend-overlay"
  >
    <Toast
      v-show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />

    <form
      @submit.prevent="verifyOTP"
      class="bg-body w-full max-w-[560px] flex flex-col gap-6 rounded-t-[18px] md:rounded-[18px] border border-minputb md:border-inputb px-6 md:px-10 py-8 justify-center items-center relative"
    >
      <!-- <button
        @click="handleBack"
        class="absolute top-4 right-4 text-white hover:text-red-500 transition-colors duration-300 focus:outline-none"
        type="button"
      >
        <CloseIcon class="w-6 h-6" />
      </button> -->

      <div class="flex justify-center">
        <img
          class="w-[60px] h-[60px] object-contain"
          src="@/assets/logo2.png"
          alt="Logo"
        />
      </div>

      <h1 class="font-orbitron text-2xl md:text-3xl text-center">
        Verify your email
      </h1>

      <p class="font-orbitron text-type text-[#665E59] text-center">
        Enter the code sent to your email
      </p>

      <div class="flex gap-3 justify-center" @paste="handlePaste">
        <template v-for="(digit, index) in otpDigits" :key="index">
          <input
            :value="digit"
            @input="handleInput(index, $event)"
            @keydown="handleBackspace(index, $event)"
            class="otp-input w-[50px] h-[50px] rounded-[8px] hover:scale-[1.1] border border-inputb bg-[#1e1e1e] text-white text-center transition-transform focus:outline-none focus:border-gold"
            type="text"
            maxlength="1"
            inputmode="numeric"
            pattern="\d*"
          />
        </template>
      </div>

      <div class="text-center">
        <p class="font-orbitron text-center text-smallest text-[#4A4F4A]">
          Didn't receive code?
        </p>
        <button
          type="button"
          @click="resendOTP"
          class="font-orbitron text-smallest text-[#4A4F4A] hover:text-gold transition-colors cursor-pointer"
        >
          Resend code
        </button>
      </div>

      <div
        class="flex md:flex-row md:justify-between w-full max-w-[520px] items-center flex-col-reverse gap-4"
      >
        <button
          type="button"
          @click="handleBack"
          class="flex justify-center items-center gap-1 cursor-pointer hover:text-gold transition-colors"
        >
          <img class="size-4 move-left" src="@/assets/Icon.png" alt="Back" />
          <span class="font-orbitron">Back</span>
        </button>

        <button
          type="submit"
          :disabled="loading"
          class="h-13 w-full md:w-52 bg-gold text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer hover:bg-[#CE8F00] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
        >
          {{ loading ? "Verifying..." : "Continue" }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.otp-input {
  background-color: #1e1e1e;
}

.otp-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-input[type="number"] {
  -moz-appearance: textfield;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import Toast from "~/components/Toast/Toast.vue";
import CloseIcon from "~/components/CloseIcon/CloseIcon.vue";
import gsap from "gsap";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();
const router = useRouter();

// OTP state
const otpDigits = ref(["", "", "", "", "", ""]);
const otpInputs = ref([]);
const loading = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("error");

// Handle OTP input
const handleInput = (index, event) => {
  const value = event.target.value;
  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    event.target.value = "";
    return;
  }

  otpDigits.value[index] = value;

  // Move to next input if value is entered
  if (value && index < otpInputs.value.length - 1) {
    otpInputs.value[index + 1].focus();
  }
};

// Handle backspace
const handleBackspace = (index, event) => {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1].focus();
  }
};

// Handle paste
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData("text");
  const numbers = pastedData.match(/\d/g);

  if (numbers) {
    numbers.slice(0, 6).forEach((number, index) => {
      if (index < otpDigits.value.length) {
        otpDigits.value[index] = number;
        otpInputs.value[index].value = number;
      }
    });
    // Focus last input
    otpInputs.value[
      Math.min(numbers.length, otpDigits.value.length) - 1
    ].focus();
  }
};

// Verify OTP
const verifyOTP = async () => {
  const otp = otpDigits.value.join("");
  if (otp.length !== 6) {
    toastMessage.value = "Please enter all digits";
    toastType.value = "error";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
    return;
  }

  loading.value = true;
  try {
    const response = await authStore.verifyOTP(otp);
    toastMessage.value = response?.message || "OTP verified successfully!";
    toastType.value = "success";
    showToast.value = true;

    // Navigate to watch after successful verification
    setTimeout(() => {
      navigateTo("/watch");
    }, 1000);
  } catch (error) {
    toastMessage.value =
      error?.response?.data?.message || "Invalid OTP. Please try again.";
    toastType.value = "error";
    showToast.value = true;
  } finally {
    loading.value = false;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }
};

// Resend OTP
const resendOTP = async () => {
  try {
    const response = await authStore.resendOTP();
    toastMessage.value = response?.message || "OTP resent successfully!";
    toastType.value = "success";
    showToast.value = true;

    // Clear existing OTP
    otpDigits.value = ["", "", "", "", "", ""];
    otpInputs.value.forEach((input) => (input.value = ""));
    otpInputs.value[0].focus();
  } catch (error) {
    toastMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to resend OTP";
    toastType.value = "error";
    showToast.value = true;
  } finally {
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }
};

// Handle back navigation
const handleBack = () => {
  navigateTo("/signup");
};

// Initialize focus on first input
onMounted(() => {
  otpInputs.value = document.querySelectorAll(".otp-input");
  otpInputs.value[0].focus();
});

// Animation
onMounted(() => {
  const moveLeft = document.querySelector(".move-left");
  if (moveLeft) {
    gsap
      .timeline({
        repeat: -1,
        repeatDelay: 1,
        duration: 0.5,
      })
      .fromTo(moveLeft, { x: 0 }, { x: -10 });
  }
});
</script>