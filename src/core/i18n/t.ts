import vi from './vi';
import en from './en';
import { settings$ } from '../../state/settings';

const dictionaries = {
  vi,
  en
};

type NestedKeyOf<ObjectType extends object> = 
{[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object 
? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
: `${Key}`
}[keyof ObjectType & (string | number)];

export type TranslationKey = keyof typeof vi;

export function t(key: TranslationKey): string {
  const locale = settings$.locale.get() || 'vi';
  const dict = dictionaries[locale as 'vi' | 'en'] || dictionaries.vi;
  return dict[key] || key;
}
