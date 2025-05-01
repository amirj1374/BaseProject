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
  branchCode: string
}

export interface FetchGuarantorPayload {
  nationalCode?: string | null;
  cif?: string | null;
  guarantorName?: string | null;
  loanRequestId: string;
}

export interface GuarantorDto {
  nationalCode?: string | null;
  cif?: string | null;
  guarantorName?: string | null;
}

export interface CurrenciesDto {
  description: string;
  code: string;
}

export interface CollateralDto {
  description: string;
  collateralTypeCode: string;
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
  contractTypeId: string;
  approvalType: string;
  requestType: string;
  amount: string;
  currency: string;
  facilityId: string;
  year?: number;
  month?: number;
  day?: number;
  repaymentType: string;
  collaterals: [];
  percentDeposit?: number;
}

export interface InquiryDto {
  value?: string;
  label?: string;
  collateral?: string;
}


export interface DepositAccount {
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  id: string | null;
  accountNo: string;
  accountStatus: string;
  accountType: string;
  avgBalanceHalf: string;
  avgBalanceQuarter: string;
  avgBalanceYear: string;
  branch: string;
  countCreditTurnoverHalf: string;
  countCreditTurnoverQuarter: string;
  countCreditTurnoverYear: string;
  countDebitTurnoverHalf: string;
  countDebitTurnoverQuarter: string;
  countDebitTurnoverYear: string;
  creditTurnoverHalf: string;
  creditTurnoverQuarter: string;
  creditTurnoverYear: string;
  currency: string;
  debitTurnoverHalf: string;
  debitTurnoverQuarter: string;
  debitTurnoverYear: string;
  finalBalance: string;
  interestRate: string | null;
  openingDate: string;
}

export interface DepositListResponse {
  depositList: DepositAccount[];
}

export interface ConsiderationPayload {
  havePromissoryNote : boolean,
  signatory : string | null,
  beneficiaryCustomer : string | null,
  relatedName : string | null,
  unrelatedObligationsAmount : number | null,
  currentOffersAmount : number | null,
  approvalNumber : number | null,
  approvedFacilitiesAmount : number | null,
  approvalDate: string | null
  creditLimitDate: string | null
  loanRequestId : number | null,
  atBranchLevel : boolean,
  notUsed : boolean,
  previousLoanAppropriate : boolean,
}

export interface UploadFile {
customerNumber?: string | null;
customerCode?: string | null ;
docTypeCode: string ;
file: File ;
description?: string
}
