import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import './init'; // Ensure MMKV is configured

export const settings$ = observable({
  locale: 'vi' as 'vi' | 'en',
  theme: 'light' as 'light' | 'dark' | 'high-contrast',
  fontScale: 1.0,
  notificationsEnabled: true,
  isPremium: false,
});

persistObservable(settings$, {
  local: 'app_settings',
});
