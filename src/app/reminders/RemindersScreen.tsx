import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { LegendList } from '@legendapp/list/react-native';
import { format, parse, startOfDay } from 'date-fns';

import { useAppTheme } from '../../core/theme';
import { t } from '../../core/i18n/t';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions, Reminder } from '../../state/reminders';
import { ui$ } from '../../state/ui';
import { calendar$ } from '../../state/calendar';
import { getAllPredefinedEventsForYear } from '../../core/events';
import { solarToLunar, lunarToSolar, LunarDate, getCanChiYear } from '../../core/lunar/convert';

type UnifiedEvent = {
  id: string;
  title: string;
  type: 'predefined' | 'custom';
  solarDate: Date;
  lunarDate: LunarDate;
  originalId?: string; // for custom events
};

export const RemindersScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const { colors, scale } = useAppTheme();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const styles = useMemo(() => createStyles(colors, scale, insets, activeTab), [colors, scale, insets, activeTab]);
  const reminders = reminders$.get();

  const currentYear = new Date().getFullYear();
  const today = startOfDay(new Date());

  // Aggregate all events for the current year
  const unifiedEvents = useMemo(() => {
    const events: UnifiedEvent[] = [];

    // 1. Predefined Events (Holidays)
    const predefined = getAllPredefinedEventsForYear(currentYear);
    for (const p of predefined) {
      events.push({
        id: p.id,
        title: t(p.key) || p.key,
        type: 'predefined',
        solarDate: p.solarDate,
        lunarDate: p.lunarDate,
      });
    }

    // 2. Custom User Reminders
    for (const r of reminders) {
      let eventSolarDate: Date | null = null;
      let eventLunarDate: LunarDate | null = null;

      if (r.calendarType === 'solar') {
        const parsed = parse(r.date, 'yyyy-MM-dd', new Date());
        if (!isNaN(parsed.getTime())) {
          // If repeatYearly, project to current year
          const projectedDate = r.repeatYearly ? new Date(currentYear, parsed.getMonth(), parsed.getDate()) : parsed;
          if (projectedDate.getFullYear() === currentYear) {
            eventSolarDate = projectedDate;
            eventLunarDate = solarToLunar(projectedDate.getDate(), projectedDate.getMonth() + 1, projectedDate.getFullYear());
          }
        }
      } else {
        // Lunar reminder (date is dd/MM/yyyy)
        const parts = r.date.split('/');
        if (parts.length === 3) {
          const lDay = parseInt(parts[0], 10);
          const lMonth = parseInt(parts[1], 10);
          const lYear = r.repeatYearly ? currentYear : parseInt(parts[2], 10);

          // Note: for repeatYearly, lunar year = current solar year. 
          // (They roughly align. e.g. Tet is Lunar month 1, Solar Jan/Feb)
          if (r.repeatYearly || lYear === currentYear || (lYear === currentYear - 1 && lMonth === 12)) {
            // Convert to solar to check if it falls in currentYear
            // This isn't perfect for edge cases but good enough for general display
            const solar = lunarToSolar(lDay, lMonth, lYear);
            if (solar.getFullYear() === currentYear) {
              eventSolarDate = solar;
              eventLunarDate = { day: lDay, month: lMonth, year: lYear, isLeap: false };
            }
          }
        }
      }

      if (eventSolarDate && eventLunarDate) {
        events.push({
          id: `custom_${r.id}_${currentYear}`,
          title: r.title,
          type: 'custom',
          solarDate: eventSolarDate,
          lunarDate: eventLunarDate,
          originalId: r.id,
        });
      }
    }

    // Sort all events chronologically
    return events.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
  }, [reminders, currentYear]);

  // Split into Upcoming and Past
  const { upcoming, past } = useMemo(() => {
    const todayTime = today.getTime();
    return {
      past: unifiedEvents.filter(e => e.solarDate.getTime() < todayTime).reverse(), // Most recent past first
      upcoming: unifiedEvents.filter(e => e.solarDate.getTime() >= todayTime) // Soonest upcoming first
    };
  }, [unifiedEvents, today]);

  const displayData = activeTab === 'upcoming' ? upcoming : past;

  const handleAdd = () => {
    overlay.showModal({ type: 'reminder_edit', props: {} });
  };

  const handleEdit = (id: string) => {
    overlay.showModal({ type: 'reminder_edit', props: { existingId: id } });
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('reminders.deleteConfirmTitle'), t('reminders.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('reminders.delete'), style: 'destructive', onPress: () => {
          remindersActions.deleteReminder(id);
          overlay.showToast(t('reminders.deleted'));
        }
      }
    ]);
  };

  const handleItemPress = (item: UnifiedEvent) => {
    // Navigate to calendar screen and focus on the event's date
    const isoDate = format(item.solarDate, 'yyyy-MM-dd');
    calendar$.selectedDate.set(isoDate);
    calendar$.jumpDate.set({ year: item.solarDate.getFullYear(), month: item.solarDate.getMonth() + 1 });
    ui$.activeTab.set('calendar');
  };

  const renderItem = ({ item }: { item: UnifiedEvent }) => {
    const isCustom = item.type === 'custom';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          <View style={styles.dateRow}>
            <Text style={styles.solarDateText}>
              {format(item.solarDate, 'dd/MM/yyyy')}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.lunarDateText}>
              {t('reminders.lunar')}: {item.lunarDate.day}/{item.lunarDate.month}
            </Text>
          </View>
        </View>

        {isCustom ? (
          <Pressable hitSlop={15} onPress={() => handleEdit(item.originalId!)} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>{t('reminders.edit')}</Text>
          </Pressable>
        ) : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t('reminders.event_badge')}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>
            {t('reminders.title')} {currentYear}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('reminders.can_chi_prefix')} {getCanChiYear(currentYear)}
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <Pressable
            style={styles.tabBtnUpcoming}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={styles.tabBtnTextUpcoming}>{t('reminders.upcoming')}</Text>
          </Pressable>
          <Pressable
            style={styles.tabBtnPast}
            onPress={() => setActiveTab('past')}
          >
            <Text style={styles.tabBtnTextPast}>{t('reminders.past')}</Text>
          </Pressable>
        </View>
      </View>

      <LegendList
        key={activeTab}
        data={displayData}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {t('reminders.empty')}
            </Text>
          </View>
        }
        renderItem={renderItem}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.8 }
        ]}
        onPress={handleAdd}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
});

const createStyles = (colors: any, scale: (size: number) => number, insets: any, activeTab: string) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: insets.top,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 0,
    fontSize: scale(28),
    color: colors.text,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headerSubtitle: {
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 20,
    fontSize: scale(14),
    color: colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    backgroundColor: colors.surface,
  },
  tabBtnUpcoming: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: activeTab === 'upcoming' ? colors.primary : 'transparent',
  },
  tabBtnPast: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: activeTab === 'past' ? colors.primary : 'transparent',
  },
  tabBtnTextUpcoming: {
    fontWeight: activeTab === 'upcoming' ? 'bold' : '500',
    fontSize: scale(14),
    color: activeTab === 'upcoming' ? '#fff' : colors.text,
  },
  tabBtnTextPast: {
    fontWeight: activeTab === 'past' ? 'bold' : '500',
    fontSize: scale(14),
    color: activeTab === 'past' ? '#fff' : colors.text,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: scale(17),
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  solarDateText: {
    fontWeight: '600',
    fontSize: scale(14),
    color: colors.primary,
  },
  lunarDateText: {
    fontWeight: '400',
    fontSize: scale(14),
    color: colors.textMuted,
  },
  dot: {
    marginHorizontal: 8,
    color: colors.textMuted,
  },
  actionBtn: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  actionBtnText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  badgeText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: scale(11),
    color: colors.textMuted,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontWeight: '500',
    fontSize: scale(16),
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: insets.bottom + 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: colors.primary,
  },
  fabText: {
    color: '#fff',
    marginTop: -4,
    fontSize: scale(32),
  }
});
