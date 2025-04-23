export interface CustomerDto {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  id?: number;
  trackingCode?: string;
  status?: string;
  requestDate?: string;
  cif?: string;
  summery?: string;
  branchCode?: string;
  nationalCode?: string;
  customerName?: string;
  address?: number;
  postalCode?: number;
  phoneNo?: number;
  branchName?: string;
}

export interface FetchCustomerPayload {
  cif?: string | null;
  nationalCode?: string | null;
  loanRequestId: string;
}

export interface FetchGuarantorPayload {
  nationalCode?: string | null;
  loanRequestId: string;
}

export interface CurrenciesDto {
  description: string;
  code: string;
}

export interface ContractTypeDto {
  id: number;
  parentId: number;
  code: string;
  shortTitle: string;
  longTitle: string;
  mainGroup: string;
  childOrder: string;
  activationDate: string;
  equivalentCode: number;
  parameterValue: string;
  active: string;
}

export interface FacilitiesDto {
  facilityId: number;
  facilityCode: string;
  facilityName: string;
  contractId: number;
}

export interface RequestInformationDto {
  currency: string;
  day: string;
  month: string;
  price?: string;
  pricePercentage?: string;
  selectedApprovalType: string;
  selectedCollateral: number;
  selectedContractType: number;
  selectedFacilities: string;
  selectedRepaymentType: string;
  term: number;
  year: string;
}
