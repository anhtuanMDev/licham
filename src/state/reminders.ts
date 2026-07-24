import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import './init'; // Ensure MMKV is configured

export type Reminder = {
  id: string;
  title: string;
  calendarType: 'solar' | 'lunar';
  date: string; // ISO date or lunar format
  repeatYearly: boolean;
  notifId?: string;
};

export const reminders$ = observable<Reminder[]>([]);

persistObservable(reminders$, {
  local: 'app_reminders',
});
