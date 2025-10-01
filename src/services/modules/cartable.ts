import type { addCreditApprovalDescriptionPayload, RecentlyApprovalDTO } from '@/types/approval/approvalType';
import type {
  SubmitChangeSignerPayload,
  SubmitReferencePayload,
  SubmitSignPayload,
  ValidUserPayload
} from '@/types/cartable/cartableTypes';
import type {
  CreditApprovalFinancialSummaryDTO,
  CreditApprovalLastDecisionDTO,
  CreditSuggestionData,
  CreditSuggestionDescriptionData
} from '@/types/preApproval/preApprovalTypes';
import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getCartable(trackingCode: string) {
    return axiosInstance.get("api/v1/cartable", { params: {trackingCode},});
  },

  saveCartable(trackingCode: string) {
    return axiosInstance.post("api/v1/cartable", {trackingCode});
  },

  getCartableDetail(id: number) {
    return axiosInstance.get(`api/v1/cartable/${id}`);
  },

  getValidRoles(id: number) {
    return axiosInstance.get(`api/v1/cartable/${id}/get-valid-roles`);
  },

  getValidSigner(id: number) {
    return axiosInstance.get(`api/v1/cartable/${id}/valid-signers`);
  },
  getValidUser(payload: ValidUserPayload) {
    return axiosInstance.get(`api/v1/cartable/${payload.id}/get-valid-users?actionType=${payload.actionType}&roleName=${payload.roleName}`,{
      timeout: 40000,
    });
  },
  submitReference(payload: SubmitReferencePayload) {
    return axiosInstance.post("api/v1/cartable/submit", payload);
  },
  submitChangeSigner(payload: SubmitChangeSignerPayload, id: number) {
    return axiosInstance.post(`/api/v1/cartable/${id}/signer`, payload);
  },
  getSamapRole() {
    return axiosInstance.get("api/v1/role/samap");
  },
  getLotusRole() {
    return axiosInstance.get("api/v1/role/lotus");
  },

  submitSign(payload: SubmitSignPayload) {
    return axiosInstance.post("api/v1/cartable/sign", payload);
  },
  
  getLoanRequestId(cartableId: string) {
    return axiosInstance.get(`api/v1/cartable/${cartableId}/loan-request/id`);
  },

  getCreditApprovalReport(cartableId: string) {
    return axiosInstance.get(`api/v1/credit-approvals/report/base?cartableId=${cartableId}`);
  },
  
  saveCreditApproval(cartableId: string , payload: CreditApprovalFinancialSummaryDTO) {
    return axiosInstance.post(`api/v1/credit-approvals/financial-summary/${cartableId} `, payload);
  },

  saveLastDecision(cartableId: string , payload: CreditApprovalLastDecisionDTO) {
    return axiosInstance.post(`api/v1/credit-approvals/last-decision/${cartableId}`, payload);
  },

  getCreditApproval(cartableId: string) {
    return axiosInstance.get(`api/v1/credit-approvals/summary/${cartableId}`);
  },

  getLoanRequestDetail(loanRequestId: string) {
    return axiosInstance.get(`api/v1/general/more-approval-detail?loanRequestId=${loanRequestId}`);
  },

  getCreditSuggestion(cartableId: string) {
    return axiosInstance.get(`api/v1/credit-suggestions?cartableId=${cartableId}`);
  },

  submitCreditSuggestion(cartableId: string, payload: CreditSuggestionData) {
    return axiosInstance.post(`api/v1/credit-suggestions/${cartableId}`, payload);
  },

  submitCreditSuggestionDescription(payload: CreditSuggestionDescriptionData) {
    return axiosInstance.post(`api/v1/credit-suggestions/add-Credit-Approval-Description`, payload);
  },

  submitExpertReport(formData: FormData) {
    return axiosInstance.post(`api/v1/cartable/attach-expert-report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getCreditSuggestionReport(cartableId: string) {
    return axiosInstance.get(`api/v1/credit-suggestions/report/base?cartableId=${cartableId}`);
  },

  getRegionApprovalReport(cartableId: string) {
    return axiosInstance.get(`api/v1/credit-suggestions/region-approval-letter/base?cartableId=${cartableId}`);
  },

  
  uploadRegionApprovalReport(cartableId: string) {
    return axiosInstance.post(`api/v1/credit-suggestions/upload-region-approval-letter?cartableId=${cartableId}`);
  },

  uploadDirectiveReport(cartableId: string) {
    return axiosInstance.post(`api/v1/credit-suggestions/upload-report?cartableId=${cartableId}` );
  },

  uploadPreApprovalReport(cartableId: string) {
    return axiosInstance.post(`api/v1/credit-approvals/upload-report?cartableId=${cartableId}` );
  },

  addCreditApprovalDescription(payload: addCreditApprovalDescriptionPayload) {
    return axiosInstance.post('api/v1/credit-suggestions/add-Credit-Approval-Description', payload);
  },

  addRecentlyApproved(cartabId: string,payload: RecentlyApprovalDTO) {
    return axiosInstance.post(`api/v1/recently-approved/${cartabId}`, payload);
  },

  getRecentlyApproved(cartabId: string) {
    return axiosInstance.get(`api/v1/recently-approved/${cartabId}?page=0&size=10`);
  },
});
