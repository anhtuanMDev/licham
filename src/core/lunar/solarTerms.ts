import { TranslationKey } from '../i18n/t';

export const SOLAR_TERMS: TranslationKey[] = [
  'term.xuan_phan', 'term.thanh_minh', 'term.coc_vu', 'term.lap_ha', 'term.tieu_man', 'term.mang_chung',
  'term.ha_chi', 'term.tieu_thu', 'term.dai_thu', 'term.lap_thu', 'term.xu_thu', 'term.bach_lo',
  'term.thu_phan', 'term.han_lo', 'term.suong_giang', 'term.lap_dong', 'term.tieu_tuyet', 'term.dai_tuyet',
  'term.dong_chi', 'term.tieu_han', 'term.dai_han', 'term.lap_xuan', 'term.vu_thuy', 'term.kinh_trap'
];

export function getSolarTerm(solarDate: Date): TranslationKey | null {
  // TODO: Implement calculation based on sun longitude or lookup table
  return null;
}
