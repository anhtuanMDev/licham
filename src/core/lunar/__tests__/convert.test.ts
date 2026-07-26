import { solarToLunar, lunarToSolar } from '../convert';

describe('Lunar Conversion — @baostudio/viet-lunar', () => {
  // Reference dates from authoritative Vietnamese lunar calendars

  it('Tet 2024: solar Feb 10 = lunar 1/1/2024', () => {
    const result = solarToLunar(10, 2, 2024);
    expect(result.day).toBe(1);
    expect(result.month).toBe(1);
    expect(result.year).toBe(2024);
    expect(result.isLeap).toBe(false);
  });

  it('Tet 2026: solar Feb 17 = lunar 1/1/2026', () => {
    const result = solarToLunar(17, 2, 2026);
    expect(result.day).toBe(1);
    expect(result.month).toBe(1);
    expect(result.year).toBe(2026);
    expect(result.isLeap).toBe(false);
  });

  it('solar 01/07/2026 = lunar 17/5/2026', () => {
    const result = solarToLunar(1, 7, 2026);
    expect(result.day).toBe(17);
    expect(result.month).toBe(5);
    expect(result.year).toBe(2026);
  });

  it('month boundary: solar 14/07/2026 = lunar 1/6/2026', () => {
    const result = solarToLunar(14, 7, 2026);
    expect(result.day).toBe(1);
    expect(result.month).toBe(6);
    expect(result.year).toBe(2026);
    expect(result.isLeap).toBe(false);
  });

  it('solar 25/07/2026 = lunar 12/6/2026 (not 1/6, not 26/6)', () => {
    const result = solarToLunar(25, 7, 2026);
    expect(result.day).toBe(12);
    expect(result.month).toBe(6);
    expect(result.year).toBe(2026);
  });

  it('solar 26/07/2026 = lunar 13/6/2026', () => {
    const result = solarToLunar(26, 7, 2026);
    expect(result.day).toBe(13);
    expect(result.month).toBe(6);
    expect(result.year).toBe(2026);
  });

  it('2025 leap month 6: solar Aug 1 falls in leap month 6', () => {
    const result = solarToLunar(1, 8, 2025);
    expect(result.month).toBe(6);
    expect(result.isLeap).toBe(true);
  });

  it('round-trip: lunarToSolar(solarToLunar(date)) returns the original date', () => {
    const testDates = [
      [10, 2, 2024],  // Tet 2024
      [17, 2, 2026],  // Tet 2026
      [25, 7, 2026],  // Mid-year
      [1, 1, 2026],   // New Year
      [31, 12, 2025], // Year boundary
    ];

    for (const [dd, mm, yy] of testDates) {
      const lunar = solarToLunar(dd, mm, yy);
      const solar = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap ? 1 : 0);
      expect(solar.getDate()).toBe(dd);
      expect(solar.getMonth() + 1).toBe(mm);
      expect(solar.getFullYear()).toBe(yy);
    }
  });
});
