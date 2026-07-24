import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import './init'; // Ensure MMKV is configured

export type SolarReminder = {
  id: string;
  title: string;
  calendarType: 'solar';
  date: string; // ISO date YYYY-MM-DD
  repeatYearly: boolean;
  notifId?: string;
};

export type LunarReminder = {
  id: string;
  title: string;
  calendarType: 'lunar';
  date: string; // DD/MM/YYYY
  repeatYearly: boolean;
  notifId?: string;
};

export type Reminder = SolarReminder | LunarReminder;

export const reminders$ = observable<Reminder[]>([]);

export const remindersActions = {
  addReminder: async (reminder: Omit<Reminder, 'id'>) => {
    const id = Date.now().toString();
    const newReminder: Reminder = { ...reminder, id };
    reminders$.push(newReminder);
    // Schedule push notification
    try {
      const { notifications } = require('../scheduling/notifications');
      await notifications.scheduleReminder(newReminder);
    } catch (e) {
      console.log('Failed to schedule notification', e);
    }
  },
  
  updateReminder: async (id: string, updates: Partial<Reminder>) => {
    const rIndex = reminders$.findIndex((r) => r.id === id);
    if (rIndex >= 0) {
      const current = reminders$[rIndex].get();
      const updated = { ...current, ...updates } as Reminder;
      reminders$[rIndex].set(updated as any);
      
      // Reschedule
      try {
        const { notifications } = require('../scheduling/notifications');
        await notifications.scheduleReminder(updated);
      } catch (e) {
        console.log('Failed to reschedule notification', e);
      }
    }
  },
  
  deleteReminder: async (id: string) => {
    const rIndex = reminders$.findIndex((r) => r.id === id);
    if (rIndex >= 0) {
      reminders$[rIndex].delete();
      
      try {
        const { notifications } = require('../scheduling/notifications');
        await notifications.cancelReminder(id);
      } catch (e) {
        console.log('Failed to cancel notification', e);
      }
    }
  }
};

persistObservable(reminders$, {
  local: 'app_reminders',
});
