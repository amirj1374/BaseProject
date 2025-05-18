import { defineStore } from 'pinia';

export const useApprovalStore = defineStore({
  id: 'approval',
  state: () => ({
    loanRequestId: '9803',
  }),

  getters: {
    getLoanRequestId: (state) => state.loanRequestId,
  },
  actions: {
    SET_LOAN_REQUEST_ID(payload: string) {
      this.loanRequestId = payload;
    },
  }

});
