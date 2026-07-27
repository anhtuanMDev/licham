import {
  solarToLunar as vlSolarToLunar,
  lunarToSolar as vlLunarToSolar,
  getCanChiYear as vlGetCanChiYear,
} from '@baostudio/viet-lunar';

export type LunarDate = {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
};

export function solarToLunar(dd: number, mm: number, yy: number, _timeZone: number = 7): LunarDate {
  const result = vlSolarToLunar({ year: yy, month: mm, day: dd });
  return {
    day: result.day,
    month: result.month,
    year: result.year,
    isLeap: result.leapMonth,
  };
}

export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, lunarLeap: number = 0, _timeZone: number = 7): Date {
  const result = vlLunarToSolar({
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    leapMonth: lunarLeap !== 0,
  });
  return new Date(result.year, result.month - 1, result.day);
}

export function getCanChiYear(year: number) {
  const result = vlGetCanChiYear(year);
  return `${result.stem} ${result.branch}`;
}
