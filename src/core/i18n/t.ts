import vi from './vi';
import en from './en';
import { observable } from '@legendapp/state';

// We could hook this into legend-state for reactivity when language changes
export const i18nState$ = observable({
  locale: 'vi' as 'vi' | 'en'
});

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
  const locale = i18nState$.locale.get();
  const dict = dictionaries[locale] || dictionaries.vi;
  return dict[key] || key;
}
