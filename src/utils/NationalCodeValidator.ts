export class NationalCodeValidator {
  static isValid(nationalCode: string): boolean {
    if (!/^\d{10,11}$/.test(nationalCode)) return false;

    const invalidCodes = [
      '0000000000', '1111111111', '2222222222', '3333333333',
      '4444444444', '5555555555', '6666666666', '7777777777',
      '8888888888', '9999999999'
    ];
    if (invalidCodes.includes(nationalCode)) return false;

    const check = +nationalCode[nationalCode.length - 1];
    const sum = nationalCode
      .split('')
      .slice(0, nationalCode.length - 1)
      .reduce((acc, digit, index) => acc + +digit * (10 - index), 0);

    const remainder = sum % 11;

    return (
      (remainder < 2 && check === remainder) ||
      (remainder >= 2 && check === 11 - remainder)
    );
  }
}
