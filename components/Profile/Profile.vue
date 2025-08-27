<template v-if ="user.user_type == 'user'">
  <ChangePassword />

  <section class="grid grid-row-3 gap-20 bg-body">
    <Navbar />
    <div
      class="grid lg:grid-cols-3 gap-11 md:px-15 px-4 lg:h-[700px] lg:items-center holder justify-center w-full row-span-3"
    >
      <div class="grid row-span-3 h-full items-center">
        <ProfileSide
        class="flex h-full "
        :firstName="user.first_name"
        :email="user.email"
        :lastName="user.last_name"
        :profileimg="user.image_url"
        :subscription="user.subscription"
      />
      </div>
      <div class="grid lg:col-span-2 profile holder row-span-3 w-full">
        <ProfileMain :firstName = 'user.first_name' :lastName="user.last_name"  />
      </div>
    </div>
    <HomeFoot class="mt-auto" />
  </section>
</template>

<style scoped>
@media (max-width: 1023px) {
  .holder {
    grid-template-rows: repeat(1 minmax(0, 1fr));
  }
}
</style>

<script setup>
import { useAuthStore } from "#imports";

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>