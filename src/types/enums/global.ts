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

// loan request status
export const LoanRequestStatusEnum = {
  TEMPORARY_REGISTRATION:'TEMPORARY_REGISTRATION',
  APPROVED:'APPROVED',
  REJECTED:'REJECTED',
  AWAITING_START_CARTABLE:'AWAITING_START_CARTABLE',
  CORRECT_FROM_REGION:'CORRECT_FROM_REGION',
  CORRECT_FROM_BRANCH:'CORRECT_FROM_BRANCH',
} as const;

export type LoanRequestStatus = (typeof LoanRequestStatusEnum)[keyof typeof LoanRequestStatusEnum];

export const LoanRequestStatusOptions = [
  { title: 'ثبت موقت', value: LoanRequestStatusEnum.TEMPORARY_REGISTRATION },
  { title: 'تایید شده', value: LoanRequestStatusEnum.APPROVED },
  { title: 'رد شده', value: LoanRequestStatusEnum.REJECTED },
  { title: 'انتظار برای شروع فرایند', value: LoanRequestStatusEnum.AWAITING_START_CARTABLE },
  { title: 'اصلاح از منطقه', value: LoanRequestStatusEnum.CORRECT_FROM_REGION },
  { title: 'اصلاح از شعبه', value: LoanRequestStatusEnum.CORRECT_FROM_BRANCH },
];

// file type

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

// lc type
export const CartableStatusTypeEnum = {
  IN_PROGRESS: 'IN_PROGRESS',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED'
} as const;

export type CartableStatusType = (typeof CartableStatusTypeEnum)[keyof typeof CartableStatusTypeEnum];

export const CartableStatusTypeOptions = [
  { title: 'در حال بررسی', value: CartableStatusTypeEnum.IN_PROGRESS },
  { title: 'تایید شده', value: CartableStatusTypeEnum.ACCEPTED },
  { title: 'رد شده', value: CartableStatusTypeEnum.REJECTED },
  { title: 'بسته شده', value: CartableStatusTypeEnum.CLOSED },
];


// department type
export const DepartmentypeEnum = {
  BRANCH	: 'BRANCH',
  HEADQUARTERS: 'HEADQUARTERS',
  CORPBANKINGORREGION: 'CORPBANKINGORREGION',
} as const;

export type DepartmentType = (typeof DepartmentypeEnum)[keyof typeof DepartmentypeEnum];

export const DepartmentTypeOptions = [
  { title: 'شعبه', value: DepartmentypeEnum.BRANCH},
  { title: 'ستاد', value: DepartmentypeEnum.HEADQUARTERS },
  { title: 'منطقه', value: DepartmentypeEnum.CORPBANKINGORREGION },
];
