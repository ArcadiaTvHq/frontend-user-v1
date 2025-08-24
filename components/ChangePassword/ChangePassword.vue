<template>
  <div
    class="h-screen w-screen flex justify-center items-center text-white fixed top-0 left-0 z-10"
    v-if="change == true"
  >
    <div class="w-screen h-screen absolute opacity-75 bg-black z-11"></div>
    <div
      class="z-15 bg-black min-w-110 w-1/2 h-fit flex flex-col justify-center items-center gap-10 absolute rounded-[15px] border-1 border-[#5B5B5B] py-25 px-10"
    >
      <p class="text-[24px] font-inter font-bold">Change Password</p>
      <form
        class="max-w-110 w-full flex flex-col gap-5 justify-center items-center shrink-1"
        @submit.prevent="submit"
      >
        <div class="flex flex-col w-full gap-1">
          <label>Current Password</label>
          <input
            placeholder="Enter your current password"
            class="h-13 border-1 border-[#5B5B5B] rounded-[8px] w-full bg-inputb px-3"
            v-model="form.currentPassword"
          />
        </div>
        <div class="flex flex-col w-full gap-1">
          <label>New Password</label>
          <input
            class="h-13 border-1 border-[#5B5B5B] rounded-[8px] w-full bg-inputb px-3"
            v-model="form.newPassword"
          />
        </div>
        <div class="h-2 bg-gold"></div>
        <div class="flex flex-col w-full gap-1">
          <label>Confirm new password</label>
          <input
            class="h-13 border-1 border-[#5B5B5B] rounded-[8px] w-full bg-inputb px-3"
            v-model="form.confirmPassword"
          />
        </div>
        <div class="flex justify-between w-full mt-3">
          <button
            class="h-12 lg:w-48 bg-[#D1D1D1] text-black rounded-[8px] btn w-24"
            type="button"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="h-12 lg:w-48 bg-gold text-black rounded-[8px] btn w-24"
          >
            {{ isLoading ? "loading..." : "Continue" }}
          </button>
        </div>
      </form>
      <Toast
        v-if="toast.showToast"
        :message="toast.message"
        :duration="3000"
        :type="toast.type"
        :show="toast.showToast"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useModal } from "../../stores/modals";
import { useAuthStore } from "#imports";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, sameAs } from "@vuelidate/validators";
import { changePassword } from "~/api/services/changepassowrd.service";
import ToastComponent from "../Toast/Toast.vue";

const Toast = ToastComponent;

const authStore = useAuthStore();
const modal = useModal();

const user = computed(() => authStore.user);

let isLoading = ref(false);
const change = computed(() => modal.isChange);

interface form {
  currentPassword: String;
  newPassword: String;
  confirmPassword: String;
}

interface ToastState {
  message: String;
  showToast: Boolean;
  type: "success" | "error";
}

const form = reactive<form>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const toast = reactive<ToastState>({
  message: "",
  showToast: true,
  type: "success",
});

const close = () => {
  (form.confirmPassword = ""),
    (form.currentPassword = ""),
    (form.newPassword = "");
  modal.toggleChange();
};

const rules = {
  currentPassword: { required, minLength: minLength(8) },
  newPassword: { required, minLength: minLength(8) },
  confirmPassword: {
    required,
    sameAsnewPassword: (value: string) => {
      value === form.newPassword || "passwords dont match";
    },
  },
};

const valid = useVuelidate(rules, form);

const submit = async () => {
  // const isValidated = await valid.value.$validate()

  //   if(!isValidated){
  //     return
  //   }
  isLoading.value = true;
  try {
    const response = await changePassword.update(form);
    toast.showToast = true;
    toast.message = "changed password successfully";
    toast.type = "success";
    close();
  } catch (err) {
    // Error handled silently
  } finally {
    isLoading.value = false;
  }
};
</script>