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
        <Text style={styles.emptyText}>Không có sự kiện nào trong tháng này</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MonthEvent }) => {
    return (
      <Pressable 
        style={({ pressed }) => [styles.eventCard, pressed && styles.eventCardPressed]}
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
        <View style={[styles.typeBadge, item.type === 'holiday' ? styles.typeBadgeHoliday : styles.typeBadgeReminder]}>
          <Text style={[styles.typeBadgeText, item.type === 'holiday' ? styles.typeBadgeTextHoliday : styles.typeBadgeTextReminder]}>
            {item.type === 'holiday' ? 'Lễ' : 'Nhắc nhở'}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Sự kiện trong tháng</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventCardPressed: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  dateBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateBadgeDay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  eventDateSub: {
    fontSize: 13,
    color: '#666',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  typeBadgeHoliday: {
    backgroundColor: '#fef1f2',
  },
  typeBadgeReminder: {
    backgroundColor: '#e6f4ea',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadgeTextHoliday: {
    color: '#d93025',
  },
  typeBadgeTextReminder: {
    color: '#137333',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  }
});
