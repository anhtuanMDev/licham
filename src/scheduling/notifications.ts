import notifee, { TimestampTrigger, TriggerType, AndroidImportance } from '@notifee/react-native';
import { Reminder } from '../state/reminders';
import { lunarToSolar, solarToLunar } from '../core/lunar/convert';
import { format, parse, isBefore, addYears } from 'date-fns';

export const notifications = {
  async requestPermission() {
    await notifee.requestPermission();
  },

  async scheduleReminder(reminder: Reminder) {
    // 1. Calculate the target solar date for the reminder
    let targetSolarDate: Date;
    const now = new Date();

    if (reminder.calendarType === 'solar') {
      targetSolarDate = parse(reminder.date, 'yyyy-MM-dd', new Date());
      if (reminder.repeatYearly && isBefore(targetSolarDate, now)) {
        targetSolarDate = addYears(targetSolarDate, 1);
      }
    } else {
      // Lunar date is usually saved as DD/MM/YYYY
      const [dayStr, monthStr, yearStr] = reminder.date.split('/');
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      let year = yearStr ? parseInt(yearStr, 10) : solarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear()).year;
      
      targetSolarDate = lunarToSolar(day, month, year, 0); // 0 = not leap
      
      if (reminder.repeatYearly && isBefore(targetSolarDate, now)) {
        year += 1;
        targetSolarDate = lunarToSolar(day, month, year, 0);
      }
    }

    if (isBefore(targetSolarDate, now)) {
      return; // Can't schedule in the past if not repeating
    }

    // Set time to 8:00 AM for reminders
    targetSolarDate.setHours(8, 0, 0, 0);

    // 2. Schedule with Notifee
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: targetSolarDate.getTime(),
    };

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'reminders',
      name: 'Reminders',
      importance: AndroidImportance.HIGH,
    });

    await notifee.createTriggerNotification(
      {
        id: reminder.id,
        title: reminder.title,
        body: `Nhắc nhở: ${reminder.title}`,
        android: {
          channelId,
        },
      },
      trigger,
    );
  },

  async cancelReminder(reminderId: string) {
    await notifee.cancelNotification(reminderId);
  }
};
