import { solarToLunar } from './convert';
import { getDayCanChi } from './canChi';

export type GoodDayResult = {
  solarDate: Date;
  lunarDate: { day: number; month: number; year: number };
  isHoangDao: boolean;
  reason: string;
};

// Hoang Dao days based on Lunar Month Branch
// Tý=0, Sửu=1, Dần=2, Mão=3, Thìn=4, Tỵ=5, Ngọ=6, Mùi=7, Thân=8, Dậu=9, Tuất=10, Hợi=11
const HOANG_DAO_TABLE: Record<number, number[]> = {
  2: [0, 1, 4, 5, 7, 10], // Dần (Tháng 1)
  8: [0, 1, 4, 5, 7, 10], // Thân (Tháng 7)
  3: [2, 3, 6, 7, 9, 0],  // Mão (Tháng 2)
  9: [2, 3, 6, 7, 9, 0],  // Dậu (Tháng 8)
  4: [4, 5, 8, 9, 11, 2], // Thìn (Tháng 3)
  10: [4, 5, 8, 9, 11, 2], // Tuất (Tháng 9)
  5: [6, 7, 10, 11, 1, 4], // Tỵ (Tháng 4)
  11: [6, 7, 10, 11, 1, 4], // Hợi (Tháng 10)
  6: [8, 9, 0, 1, 3, 6],  // Ngọ (Tháng 5)
  0: [8, 9, 0, 1, 3, 6],  // Tý (Tháng 11)
  7: [10, 11, 2, 3, 5, 8], // Mùi (Tháng 6)
  1: [10, 11, 2, 3, 5, 8], // Sửu (Tháng 12)
};

const TAM_NUONG = [3, 7, 13, 18, 22, 27];
const NGUYET_KY = [5, 14, 23];

export function findGoodDays(startDate: Date, daysToScan: number = 30, purpose: 'any' | 'wedding' | 'moving' = 'any'): GoodDayResult[] {
  const results: GoodDayResult[] = [];
  
  for (let i = 0; i < daysToScan; i++) {
    const scanDate = new Date(startDate);
    scanDate.setDate(startDate.getDate() + i);
    
    const lunar = solarToLunar(scanDate.getDate(), scanDate.getMonth() + 1, scanDate.getFullYear());
    const monthBranch = (lunar.month + 1) % 12;
    const { branchIndex: dayBranch } = getDayCanChi(scanDate);
    
    const isHoangDao = HOANG_DAO_TABLE[monthBranch]?.includes(dayBranch);
    
    if (isHoangDao) {
      // Filter logic based on purpose
      let isGoodForPurpose = true;
      let reason = 'Ngày Hoàng Đạo';

      if (purpose === 'wedding' || purpose === 'moving') {
        if (TAM_NUONG.includes(lunar.day)) {
          isGoodForPurpose = false; // Phù hợp mọi việc nhưng kỵ cưới/nhà cửa
        } else if (NGUYET_KY.includes(lunar.day)) {
          isGoodForPurpose = false;
        } else {
          reason += purpose === 'wedding' ? ' (Rất tốt cho Cưới hỏi)' : ' (Rất tốt cho Nhập trạch)';
        }
      } else {
        reason += ' (Tốt mọi việc)';
      }
      
      if (isGoodForPurpose) {
        results.push({
          solarDate: scanDate,
          lunarDate: lunar,
          isHoangDao: true,
          reason
        });
      }
    }
  }
  
  return results;
}
