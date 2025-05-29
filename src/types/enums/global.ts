export const Global = {
  TRUE: true,
  FALSE: false
} as const;

export type BooleanStatus = (typeof Global)[keyof typeof Global];

export const BooleanEnumOptions = [
  { title: '✅', value: Global.TRUE },
  { title: '❌', value: Global.FALSE }
];

export const requestTypeStatusEnum = [
  { title: 'LOAN', value: 'LOAN' },
  { title: 'LC', value: 'LC' },
  { title: 'OBLIGATION', value: 'OBLIGATION' }
] as const;

export type requestTypeStatus = typeof requestTypeStatusEnum[number]['value'];

export const RequestTypeStatusOptions = [
  { title: 'تسهیلات', value: 'LOAN' },
  { title: 'اعتبار اسنادی', value: 'LC' },
  { title: 'ضمانت نامه', value: 'OBLIGATION' }
];