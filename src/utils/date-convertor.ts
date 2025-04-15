// utils/dateConverter.ts
import jalaali from 'jalaali-js';

export class DateConverter {
  // Convert Gregorian to Shamsi
  static toShamsi(dateStr: string): string {
    const date = new Date(dateStr);
    const { gy, gm, gd } = {
      gy: date.getFullYear(),
      gm: date.getMonth() + 1, // JS months are 0-based
      gd: date.getDate(),
    };

    const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  }

  // Convert Shamsi to Gregorian
  static toGregorian(jalaliStr: string): string {
    const [jy, jm, jd] = jalaliStr.split('/').map(Number);
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  }
}
