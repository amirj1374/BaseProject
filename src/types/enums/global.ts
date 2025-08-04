// boolean status
export const Global = {
  TRUE: true,
  FALSE: false
} as const;

export type BooleanStatus = (typeof Global)[keyof typeof Global];

export const BooleanEnumOptions = [
  { title: '✅', value: Global.TRUE },
  { title: '❌', value: Global.FALSE }
];

// request type status
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

// relation type

export const RelationTypeEnum = {
  ASKER: 'ASKER',
  GUARANTOR: 'GUARANTOR'
} as const;

export type RelationType = (typeof RelationTypeEnum)[keyof typeof RelationTypeEnum];

export const RelationTypeOptions = [
  { title: 'متقاضی', value: RelationTypeEnum.ASKER },
  { title: 'ضامن', value: RelationTypeEnum.GUARANTOR },
];

// action type

export const ActionTypeEnum = {
  APPROVED:'APPROVED',
  REJECTED:'REJECTED',
  REFERRED:'REFERRED',
  CORRECTED:'CORRECTED',
  CREATED:'CREATED',
  CLOSED:'CLOSED',
  PASSED:'PASSED',
  REFERRED_FOR_SIGNED:'REFERRED_FOR_SIGNED',
} as const;

export type ActionType = (typeof ActionTypeEnum)[keyof typeof ActionTypeEnum];

export const ActionTypeOptions = [
  { title: 'تایید', value: ActionTypeEnum.APPROVED },
  { title: 'رد', value: ActionTypeEnum.REJECTED },
  { title: 'ارجاع', value: ActionTypeEnum.REFERRED },
  { title: 'اصلاح', value: ActionTypeEnum.CORRECTED },
  { title: 'ایجاد', value: ActionTypeEnum.CREATED },
  { title: 'اتمام', value: ActionTypeEnum.CLOSED },
  { title: 'ارجاع', value: ActionTypeEnum.PASSED },
  { title: 'ارجاع برای امضا', value: ActionTypeEnum.REFERRED_FOR_SIGNED },
];

// action type

export const FileTypeEnum = {
  NATIONAL_CARD:'NATIONAL_CARD',
  IDENTITY_CERTIFICATE:'IDENTITY_CERTIFICATE',
  DECLARATION:'DECLARATION',
  BUSINESS_LICENSE:'BUSINESS_LICENSE',
  EMPLOYMENT_CERTIFICATE:'EMPLOYMENT_CERTIFICATE',
  DEDUCTION_FROM_SALARY:'DEDUCTION_FROM_SALARY',
  PROOF_IF_RESIDENCE:'PROOF_IF_RESIDENCE',
  CONFIRM_POST_OFFICE:'CONFIRM_POST_OFFICE',
} as const;

export type fileType = (typeof FileTypeEnum)[keyof typeof FileTypeEnum];

export const FileTypeOptions = [
  { title: 'کارت ملی', value: FileTypeEnum.NATIONAL_CARD },
  { title: 'شناسنامه', value: FileTypeEnum.IDENTITY_CERTIFICATE },
  { title: 'اساسنامه حقوقی', value: FileTypeEnum.DECLARATION },
  { title: 'جواز کسب', value: FileTypeEnum.BUSINESS_LICENSE },
  { title: 'گواهی اشتغال به کار', value: FileTypeEnum.EMPLOYMENT_CERTIFICATE },
  { title: 'کسر ار حقوق', value: FileTypeEnum.DEDUCTION_FROM_SALARY },
  { title: 'مدارک محل سکونت', value: FileTypeEnum.PROOF_IF_RESIDENCE },
  { title: 'تاییده پست', value: FileTypeEnum.CONFIRM_POST_OFFICE },
];

// credit type

export const CreditTypeEnum = {
  SIGHT_PAYMENT: 'SIGHT_PAYMENT',
  DEFERRED_PAYMENT: 'LODEFERRED_PAYMENTNG'
} as const;

export type CreditType = (typeof CreditTypeEnum)[keyof typeof CreditTypeEnum];

export const CreditTypeOptions = [
  { title: 'دیداری', value: CreditTypeEnum.SIGHT_PAYMENT },
  { title: 'مدت دار', value: CreditTypeEnum.DEFERRED_PAYMENT },
];

// lc type

export const LcTypeEnum = {
  INTERNAL: 'INTERNAL',
  IMPORT: 'IMPORT'
} as const;

export type LcType = (typeof LcTypeEnum)[keyof typeof LcTypeEnum];

export const LcTypeOptions = [
  { title: 'داخلی', value: LcTypeEnum.INTERNAL },
  { title: 'وارداتی', value: LcTypeEnum.IMPORT },
];
