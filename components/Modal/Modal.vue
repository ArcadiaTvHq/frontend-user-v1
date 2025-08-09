<template>
  <div
    v-if="waitlist"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
  >
    <div
      class="bg-darkgray rounded-[8px] p-6 md:p-8 w-full max-w-[500px] relative"
    >
      <button
        @click="handleClose"
        class="absolute top-4 right-4 text-white hover:text-gold transition-colors duration-300"
      >
        <CloseIcon />
      </button>
      <h2 class="text-[24px] font-bold mb-6">Join the Waitlist</h2>
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 w-full">
          <label>First Name</label>
          <input
            v-model="formData.firstName"
            placeholder="John"
            :class="{ 'error-input': v$.firstName.$error }"
            @blur="v$.firstName.$touch()"
          />
          <span v-if="v$.firstName.$error" class="error-text">{{
            v$.firstName.$errors[0].$message
          }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label>Last Name</label>
          <input
            v-model="formData.lastName"
            placeholder="Doe"
            :class="{ 'error-input': v$.lastName.$error }"
            @blur="v$.lastName.$touch()"
          />
          <span v-if="v$.lastName.$error" class="error-text">{{
            v$.lastName.$errors[0].$message
          }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label>Email</label>
          <input
            v-model="formData.email"
            placeholder="john.doe@email.com"
            :class="{ 'error-input': v$.email.$error }"
            @blur="v$.email.$touch()"
          />
          <span v-if="v$.email.$error" class="error-text">{{
            v$.email.$errors[0].$message
          }}</span>
        </div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-[#FFD005] text-black w-full h-13 rounded-[8px] mt-4 font-bold btn hover:bg-[#CE8F00] disabled:bg-[#FFF487] transition-all duration-500 cursor-pointer"
        >
          {{ isSubmitting ? "Joining..." : "Join the waitlist" }}
        </button>
      </form>
    </div>
  </div>
  <Toast v-if="toast.show" :message="toast.message" :type="toast.type" />
</template>

<style scoped>
input {
  background-color: #1e1e1e;
  border: 1px solid var(--color-inputb);
  padding: 0 0 0 10px;
  height: 51px;
  border-radius: 8px;
}

input.error-input {
  border-color: #f44336;
}

.error-text {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
}

label {
  font-size: var(--text-type);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

<script setup lang="ts">
import { ref, reactive } from "@vue/runtime-core";
import { useVuelidate } from "@vuelidate/core";
import { required, email, minLength } from "@vuelidate/validators";
import { WaitlistService } from "../../api/services/waitlist.service";
import ToastComponent from "../Toast/Toast.vue";
import CloseIcon from "../CloseIcon/CloseIcon.vue";
import { useModal } from "#imports";

const Toast = ToastComponent;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

const modal = useModal();
const waitlist = computed(()=> modal.isWaitlist)
const isSubmitting = ref(false);

const toast = reactive<ToastState>({
  show: false,
  message: "",
  type: "success",
});

const formData = reactive<FormData>({
  firstName: "",
  lastName: "",
  email: "",
});

const rules = {
  firstName: { required, minLength: minLength(2) },
  lastName: { required, minLength: minLength(2) },
  email: { required, email },
};

const v$ = useVuelidate(rules, formData);

const handleClose = () => {
  modal.toggleWaitlist()
  v$.value.$reset();
  formData.firstName = "";
  formData.lastName = "";
  formData.email = "";
};

const handleSubmit = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  isSubmitting.value = true;

  try {
    await WaitlistService.join(formData);
    toast.show = true;
    toast.message = "Successfully joined the waitlist!";
    toast.type = "success";
    handleClose();
  } catch (error) {
    toast.show = true;
    toast.message = "Failed to join the waitlist. Please try again.";
    toast.type = "error";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
