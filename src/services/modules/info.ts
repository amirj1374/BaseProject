import type { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  fetchEnumOptions() {
    return axiosInstance.get(`/enumerationController/getWarrantyContractTypes`);
  },
});
const myArray = [
  {
    approvalContractType: {
     3: "سالانه",
      2: "موردی",
      1: "محدود",
    }
  },
  {
    repaymentType: {
      1:"قسطی",
      2:"یکجا"
    }
  },
  {
    personType: {
      2:"مشتری",
      1:"مسئول",
      3:"ضامن"
    }
  }
]