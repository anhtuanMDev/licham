import { solarToLunar } from './convert';

// For MVP, this is a very simplified stochastic stub of "Ngày Hoàng Đạo".
// True Hoang Dao calculation is based on the intersection of the Lunar Month and the Day's Earthly Branch.

export type GoodDayResult = {
  solarDate: Date;
  lunarDate: { day: number; month: number; year: number };
  isHoangDao: boolean;
  reason: string;
};

export function findGoodDays(startDate: Date, daysToScan: number = 30, purpose: 'any' | 'wedding' | 'moving' = 'any'): GoodDayResult[] {
  const results: GoodDayResult[] = [];
  
  for (let i = 0; i < daysToScan; i++) {
    const scanDate = new Date(startDate);
    scanDate.setDate(startDate.getDate() + i);
    
    const lunar = solarToLunar(scanDate.getDate(), scanDate.getMonth() + 1, scanDate.getFullYear());
    
    // Simplified MVP logic: Even lunar days are considered "good" for this stub
    // In production, this would use a strict matrix of Month Branch vs Day Branch
    const isHoangDao = (lunar.day % 2 === 0);
    
    if (isHoangDao) {
      // In MVP, we just stub the filter logic by accepting all Hoang Dao days, 
      // but we customize the reason string based on the purpose
      const purposeText = purpose === 'wedding' ? ' (Tốt cho Cưới hỏi)' : purpose === 'moving' ? ' (Tốt cho Nhập trạch)' : ' (Tốt mọi việc)';
      
      results.push({
        solarDate: scanDate,
        lunarDate: lunar,
        isHoangDao: true,
        reason: `Ngày Hoàng Đạo${purposeText}`
      });
    }
  }
  
  return results;
}
