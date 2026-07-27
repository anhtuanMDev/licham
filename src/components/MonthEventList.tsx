import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { observer } from '@legendapp/state/react';
import { format } from 'date-fns';
import { calendar$ } from '../state/calendar';
import { reminders$ } from '../state/reminders';
import { getEventsForDate } from '../core/events';
import { solarToLunar } from '../core/lunar/convert';
import { t } from '../core/i18n/t';
import { overlay } from '../overlay/overlay';
import { useAppTheme } from '../core/theme';

type MonthEvent = {
  id: string;
  dateStr: string; // e.g. "14/02"
  title: string;
  isLunar: boolean;
  type: 'holiday' | 'reminder';
  day: number;
};

export const MonthEventList = observer(() => {
  const currentMonth = calendar$.visibleMonth.get();
  const allReminders = reminders$.get() || [];
  const { colors, scale, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, scale, isDark), [colors, scale, isDark]);

  const events = useMemo(() => {
    const { year, month } = currentMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: MonthEvent[] = [];

    // Pre-process reminders for O(1) lookup
    const solarReminders = new Map<string, typeof allReminders>();
    const lunarReminders = new Map<string, typeof allReminders>();
    
    allReminders.forEach(r => {
      if (r.calendarType === 'solar') {
        const key = r.repeatYearly ? r.date.slice(-5) : r.date;
        if (!solarReminders.has(key)) solarReminders.set(key, []);
        solarReminders.get(key)!.push(r);
      } else if (r.calendarType === 'lunar') {
        const key = r.repeatYearly ? r.date.substring(0, 5) : r.date;
        if (!lunarReminders.has(key)) lunarReminders.set(key, []);
        lunarReminders.get(key)!.push(r);
      }
    });

    for (let d = 1; d <= daysInMonth; d++) {
      const solarDate = new Date(year, month - 1, d);
      const dateIso = format(solarDate, 'yyyy-MM-dd');
      let lunarDate = calendar$.lunarCache[dateIso]?.peek();
      
      if (!lunarDate) {
        lunarDate = solarToLunar(d, month, year);
      }

      // 1. Fetch built-in Holidays
      const holidays = getEventsForDate(solarDate, lunarDate);
      holidays.forEach(holidayKey => {
        result.push({
          id: `h_${d}_${holidayKey}`,
          dateStr: `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
          title: t(holidayKey),
          isLunar: false,
          type: 'holiday',
          day: d
        });
      });

      // 2. Fetch user Reminders (O(1) lookups)
      const solarKey = dateIso;
      const lunarKey = `${String(lunarDate.day).padStart(2, '0')}/${String(lunarDate.month).padStart(2, '0')}/${lunarDate.year}`;
      const lunarKeyNoYear = `${String(lunarDate.day).padStart(2, '0')}/${String(lunarDate.month).padStart(2, '0')}`;
      const solarKeyNoYear = `${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`; // MM-DD

      const todaysSolar = [...(solarReminders.get(solarKey) || []), ...(solarReminders.get(solarKeyNoYear) || [])];
      todaysSolar.forEach(reminder => {
        result.push({
          id: `r_${reminder.id}_${d}`,
          dateStr: `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
          title: reminder.title,
          isLunar: false,
          type: 'reminder',
          day: d
        });
      });

      const todaysLunar = [...(lunarReminders.get(lunarKey) || []), ...(lunarReminders.get(lunarKeyNoYear) || [])];
      todaysLunar.forEach(reminder => {
        result.push({
          id: `r_${reminder.id}_${d}`,
          dateStr: `${String(lunarDate.day).padStart(2, '0')}/${String(lunarDate.month).padStart(2, '0')} (Âm)`,
          title: reminder.title,
          isLunar: true,
          type: 'reminder',
          day: d
        });
      });
    }

    return result;
  }, [currentMonth.year, currentMonth.month, allReminders]);

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('calendar.month_events_empty')}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MonthEvent }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.eventCard,
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => overlay.showModal({
          type: 'day_detail',
          props: { dateIso: format(new Date(currentMonth.year, currentMonth.month - 1, item.day), 'yyyy-MM-dd') }
        })}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>{item.day}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.eventDateSub}>{item.dateStr}</Text>
        </View>
        <View style={item.type === 'holiday' ? styles.typeBadgeHoliday : styles.typeBadgeReminder}>
          <Text style={item.type === 'holiday' ? styles.typeBadgeTextHoliday : styles.typeBadgeTextReminder}>
            {item.type === 'holiday' ? t('calendar.badge.holiday') : t('calendar.badge.reminder')}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('calendar.month_events_title')}</Text>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {events.map(item => (
          <React.Fragment key={item.id}>
            {renderItem({ item })}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
});

const createStyles = (colors: any, scale: (n: number) => number, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 12,
    fontSize: scale(18),
    color: colors.text,
  },
  listContent: {
    paddingBottom: 24,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  dateBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.primary + '1a',
  },
  dateBadgeDay: {
    fontWeight: '700',
    fontSize: scale(16),
    color: colors.primary,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontWeight: '600',
    marginBottom: 2,
    fontSize: scale(16),
    color: colors.text,
  },
  eventDateSub: {
    fontSize: scale(13),
    color: colors.textMuted,
  },
  typeBadgeHoliday: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    backgroundColor: isDark ? '#3a1c1c' : '#fef1f2',
  },
  typeBadgeReminder: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    backgroundColor: isDark ? '#1a3320' : '#e6f4ea',
  },
  typeBadgeTextHoliday: {
    fontWeight: '600',
    fontSize: scale(12),
    color: isDark ? '#ff6b6b' : '#d93025',
  },
  typeBadgeTextReminder: {
    fontWeight: '600',
    fontSize: scale(12),
    color: isDark ? '#4caf50' : '#137333',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontStyle: 'italic',
    fontSize: scale(15),
    color: colors.textMuted,
  },
});
