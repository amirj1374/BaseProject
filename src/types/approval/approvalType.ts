export interface CustomerDto {
  createdAt?: string,
  updatedAt?: string,
  createdBy?: string,
  updatedBy?: string,
  id?: number,
  trackingCode?: string,
  status?: string,
  requestDate?: string,
  cif?: string,
  summery?: string,
  branchCode?: string,
  nationalCode?: string,
  customerName?: string
  address?: number
  postalCode?: number
  phoneNo?: number
  branchName?: string
}

export interface FetchCustomerPayload	 {
  cif?: string | null
  nationalCode?: string | null
  branchCode: string
}