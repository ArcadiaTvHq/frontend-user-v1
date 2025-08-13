import { defineStore } from "pinia";

export const useModal = defineStore('Modal', {
  state: ()=>({
    isChange: false,
    isWaitlist: false
  }),

  actions: {
    toggleChange(){
      this.isChange = !this.isChange
    },
    toggleWaitlist(){
      this.isWaitlist = !this.isWaitlist
    }
  }
})