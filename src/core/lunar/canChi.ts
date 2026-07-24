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

// TODO: Implement month and day Can Chi calculations based on Julian day or solar dates.
