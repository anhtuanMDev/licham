import { t, TranslationKey } from '../i18n/t';

export const HEAVENLY_STEMS: TranslationKey[] = [
  'stem.giap', 'stem.at', 'stem.binh', 'stem.dinh', 'stem.mau', 'stem.ky', 'stem.canh', 'stem.tan', 'stem.nham', 'stem.quy',
];

export const EARTHLY_BRANCHES: TranslationKey[] = [
  'branch.ty', 'branch.suu', 'branch.dan', 'branch.mao', 'branch.thin', 'branch.ti', 'branch.ngo', 'branch.mui', 'branch.than', 'branch.dau', 'branch.tuat', 'branch.hoi',
];

export function getYearCanChi(lunarYear: number): string {
  const stemKey = HEAVENLY_STEMS[(lunarYear + 6) % 10];
  const branchKey = EARTHLY_BRANCHES[(lunarYear + 8) % 12];
  return `${t(stemKey)} ${t(branchKey)}`;
}

// Fixed Julian Day calculation for simplified Day Can Chi
export function getDayCanChi(solarDate: Date): { canChi: string; branchKey: TranslationKey; branchIndex: number } {
  // Epoch: Jan 1, 1900 was Giáp Tuất (Stem 0, Branch 10).
  // A simplified Julian offset approach for MVP:
  const utcCurrent = Date.UTC(solarDate.getFullYear(), solarDate.getMonth(), solarDate.getDate());
  const utcEpoch = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((utcCurrent - utcEpoch) / 86400000);
  
  // Jan 1 1900: Giáp (0), Tuất (10)
  const stemIndex = (0 + diffDays) % 10;
  const branchIndex = (10 + diffDays) % 12;
  
  const stemKey = HEAVENLY_STEMS[stemIndex];
  const branchKey = EARTHLY_BRANCHES[branchIndex];
  
  return { 
    canChi: `${t(stemKey)} ${t(branchKey)}`,
    branchKey,
    branchIndex
  };
}

// Lục Xung (6 conflicting pairs): difference of 6 in the 12-branch cycle
export function getConflictingBranch(branchIndex: number): string {
  const conflictIndex = (branchIndex + 6) % 12;
  return t(EARTHLY_BRANCHES[conflictIndex]);
}
