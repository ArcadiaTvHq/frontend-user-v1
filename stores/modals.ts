import { defineStore } from "pinia";

export const useModal = defineStore('Modal', {
  state: ()=>({
    isChange: false,
    isWaitlist: false,
    isReview: false
  }),

  actions: {
    toggleChange(){
      this.isChange = !this.isChange
    },
    toggleWaitlist(){
      this.isWaitlist = !this.isWaitlist
    },
    toggleReview(){
      this.isReview = !this.isReview 
    }
  }
})