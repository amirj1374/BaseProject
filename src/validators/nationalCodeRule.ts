import { NationalCodeValidator } from '@/utils/NationalCodeValidator';

export function nationalCodeRule(value: string): string | false {
  if (!NationalCodeValidator.isValid(value)) return 'کد ملی نامعتبر است';
  return false;
}
