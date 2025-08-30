import type { CreditApprovalFinancialSummaryDTO, CreditApprovalLastDecisionDTO, PreApprovalState } from '@/types/preApproval/preApprovalTypes';
import { defineStore } from 'pinia';

export const usePreApprovalStore = defineStore('preApproval', {
  state: (): PreApprovalState => ({
    creditApprovalFinancialSummaryDTO: null,
    creditApprovalLastDecisionDTO: null,
    loading: false,
    error: null
  }),

  getters: {
    // Getter for financial summary
    getFinancialSummary: (state) => state.creditApprovalFinancialSummaryDTO,
    
    // Getter for last decision
    getLastDecision: (state) => state.creditApprovalLastDecisionDTO,
    
    // Check if data is loaded
    isDataLoaded: (state) => {
      return state.creditApprovalFinancialSummaryDTO !== null || 
             state.creditApprovalLastDecisionDTO !== null;
    },
    
    // Check if financial summary exists
    hasFinancialSummary: (state) => state.creditApprovalFinancialSummaryDTO !== null,
    
    // Check if last decision exists
    hasLastDecision: (state) => state.creditApprovalLastDecisionDTO !== null
  },

  actions: {
    // Set financial summary data
    setFinancialSummary(data: CreditApprovalFinancialSummaryDTO) {
      this.creditApprovalFinancialSummaryDTO = data;
    },

    // Set last decision data
    setLastDecision(data: CreditApprovalLastDecisionDTO) {
      this.creditApprovalLastDecisionDTO = data;
    },

    // Set both objects at once
    setPreApprovalData(data: {
      creditApprovalFinancialSummaryDTO?: CreditApprovalFinancialSummaryDTO;
      creditApprovalLastDecisionDTO?: CreditApprovalLastDecisionDTO;
    }) {
      if (data.creditApprovalFinancialSummaryDTO) {
        this.creditApprovalFinancialSummaryDTO = data.creditApprovalFinancialSummaryDTO;
      }
      if (data.creditApprovalLastDecisionDTO) {
        this.creditApprovalLastDecisionDTO = data.creditApprovalLastDecisionDTO;
      }
    },

    // Set loading state
    setLoading(loading: boolean) {
      this.loading = loading;
    },

    // Set error
    setError(error: string | null) {
      this.error = error;
    },

    // Reset store
    reset() {
      this.creditApprovalFinancialSummaryDTO = null;
      this.creditApprovalLastDecisionDTO = null;
      this.loading = false;
      this.error = null;
    },

    // Update specific field in financial summary
    updateFinancialSummaryField(field: keyof CreditApprovalFinancialSummaryDTO, value: any) {
      if (this.creditApprovalFinancialSummaryDTO) {
        (this.creditApprovalFinancialSummaryDTO as any)[field] = value;
      }
    },

    // Update specific field in last decision
    updateLastDecisionField(field: keyof CreditApprovalLastDecisionDTO, value: any) {
      if (this.creditApprovalLastDecisionDTO) {
        (this.creditApprovalLastDecisionDTO as any)[field] = value;
      }
    }
  }
});
