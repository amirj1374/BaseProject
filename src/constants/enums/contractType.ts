export const ContractTypeEnum = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
} as const;

export type ContractType = (typeof ContractTypeEnum)[keyof typeof ContractTypeEnum];

export const ContractTypeOption = [
  { title: 'اعتبار اسنادی وارداتی', value: ContractTypeEnum.IMPORT },
  { title: 'اعتبار اسنادی صادراتی', value: ContractTypeEnum.EXPORT },
];
