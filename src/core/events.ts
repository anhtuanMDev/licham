import { LunarDate } from './lunar/convert';
import { format } from 'date-fns';
import { TranslationKey } from './i18n/t';

const SOLAR_HOLIDAYS: Record<string, TranslationKey> = {
  '01/01': 'holiday.solar_new_year',
  '14/02': 'holiday.valentine',
  '08/03': 'holiday.womens_day',
  '30/04': 'holiday.liberation',
  '01/05': 'holiday.labor_day',
  '01/06': 'holiday.childrens_day',
  '02/09': 'holiday.national_day',
  '20/10': 'holiday.vn_womens_day',
  '20/11': 'holiday.teachers_day',
  '22/12': 'holiday.army_day',
  '25/12': 'holiday.christmas',
};

const LUNAR_HOLIDAYS: Record<string, TranslationKey> = {
  '01/01': 'holiday.lunar_new_year',
  '02/01': 'holiday.lunar_new_year_2',
  '03/01': 'holiday.lunar_new_year_3',
  '15/01': 'holiday.lantern_festival',
  '10/03': 'holiday.hung_kings',
  '15/04': 'holiday.vesak',
  '05/05': 'holiday.double_fifth',
  '15/07': 'holiday.vu_lan',
  '15/08': 'holiday.mid_autumn',
  '23/12': 'holiday.kitchen_gods',
};

/**
 * Returns an array of events (holidays) for a given solar and lunar date.
 */
export function getEventsForDate(solarDate: Date, lunarDate: LunarDate): TranslationKey[] {
  const events: TranslationKey[] = [];

  // Check Solar Holidays
  const solarKey = format(solarDate, 'dd/MM');
  if (SOLAR_HOLIDAYS[solarKey]) {
    events.push(SOLAR_HOLIDAYS[solarKey]);
  }

  // Check Lunar Holidays
  const lunarKey = `${String(lunarDate.day).padStart(2, '0')}/${String(lunarDate.month).padStart(2, '0')}`;
  if (LUNAR_HOLIDAYS[lunarKey]) {
    events.push(LUNAR_HOLIDAYS[lunarKey]);
  }

  // Handle Lunar New Year's Eve (Giao Thừa) dynamically
  // It falls on the last day of the 12th lunar month (either 29 or 30).
  if (lunarDate.month === 12) {
    const tomorrow = new Date(solarDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { solarToLunar } = require('./lunar/convert');
    const tomorrowLunar = solarToLunar(tomorrow.getDate(), tomorrow.getMonth() + 1, tomorrow.getFullYear());
    
    if (tomorrowLunar.day === 1 && tomorrowLunar.month === 1) {
      events.push('holiday.lunar_nye');
    }
  }

  return events;
}

export type PredefinedEvent = {
  id: string;
  key: TranslationKey;
  solarDate: Date;
  lunarDate: LunarDate;
};

/**
 * Iterates through all days of a given solar year to collect all predefined events.
 * This is robust and reuses getEventsForDate logic.
 */
export function getAllPredefinedEventsForYear(year: number): PredefinedEvent[] {
  const allEvents: PredefinedEvent[] = [];
  const { solarToLunar } = require('./lunar/convert');

  // Start from Jan 1st of the year
  const date = new Date(year, 0, 1);

  // Loop until the year changes
  while (date.getFullYear() === year) {
    const lunar = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
    const keys = getEventsForDate(date, lunar);
    
    for (const key of keys) {
      allEvents.push({
        id: `predef_${key}_${year}`,
        key,
        solarDate: new Date(date), // copy
        lunarDate: lunar,
      });
    }
    
    // Move to next day
    date.setDate(date.getDate() + 1);
  }

  return allEvents;
}
