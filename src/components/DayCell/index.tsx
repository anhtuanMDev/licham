import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
import { reminders$ } from '../../state/reminders';
import { overlay } from '../../overlay/overlay';
import { getEventsForDate } from '../../core/events';
import { parse } from 'date-fns';
import { t } from '../../core/i18n/t';
import { LunarDate } from '../../core/lunar/convert';
import { useAppTheme } from '../../core/theme';

interface DayCellProps {
  dateIso: string;
  solarDay: number;
  lunarInfo: LunarDate;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const DayCell = observer(({ dateIso, solarDay, lunarInfo, isToday, isCurrentMonth }: DayCellProps) => {
  const isSelected = calendar$.selectedDate.get() === dateIso;
  const { colors, scale } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, scale, isSelected, isToday, isCurrentMonth),
    [colors, scale, isSelected, isToday, isCurrentMonth]
  );
  
  // Check for auto-computed holidays
  const holidayEvents = lunarInfo ? getEventsForDate(parse(dateIso, 'yyyy-MM-dd', new Date()), lunarInfo) : [];
  
  // Check for custom user reminders
  const allReminders = reminders$.get() || [];
  const hasCustomEvent = allReminders.some(r => {
    if (r.calendarType === 'solar') {
      const key = r.repeatYearly ? r.date.slice(-5) : r.date;
      const target = r.repeatYearly ? dateIso.slice(-5) : dateIso;
      return key === target;
    } else if (r.calendarType === 'lunar' && lunarInfo) {
      const key = r.repeatYearly ? r.date.substring(0, 5) : r.date;
      const pad = (n: number) => String(n).padStart(2, '0');
      const target = r.repeatYearly 
        ? `${pad(lunarInfo.day)}/${pad(lunarInfo.month)}`
        : `${pad(lunarInfo.day)}/${pad(lunarInfo.month)}/${lunarInfo.year}`;
      return key === target;
    }
    return false;
  });

  const hasEvent = holidayEvents.length > 0 || hasCustomEvent;

  const handlePress = () => {
    calendar$.selectedDate.set(dateIso);
  };

  const handleLongPress = () => {
    calendar$.selectedDate.set(dateIso);
    overlay.showModal({ type: 'day_detail', props: { dateIso } });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        (isSelected || pressed) && styles.selectedContainer,
        isToday && styles.todayContainer,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${t('calendar.accessibility.day' as any)} ${solarDay} ${t('calendar.accessibility.solar_month' as any)}. ${lunarInfo ? `${t('calendar.accessibility.day' as any)} ${lunarInfo.day} ${t('calendar.accessibility.lunar_month' as any)} ${lunarInfo.month} ${t('calendar.accessibility.lunar' as any)}.` : ''}`}
      accessibilityHint={t('calendar.accessibility.hint' as any)}
    >
      <Text style={styles.solarText}>
        {solarDay}
      </Text>

      {lunarInfo && (
        <Text style={
          (lunarInfo.day === 1 || lunarInfo.day === 15)
            ? styles.lunarSpecialText
            : styles.lunarText
        }>
          {lunarInfo.day === 1 ? `${lunarInfo.day}/${lunarInfo.month}` : lunarInfo.day}
        </Text>
      )}

      {hasEvent && <View style={styles.eventDot} />}
    </Pressable>
  );
});

const createStyles = (
  colors: any,
  scale: (n: number) => number,
  isSelected: boolean,
  isToday: boolean,
  isCurrentMonth: boolean
) => StyleSheet.create({
  container: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
    ...(isSelected && {
      backgroundColor: colors.primary + '1a',
      borderColor: colors.primary,
    }),
    ...(isToday && {
      backgroundColor: colors.dangerSurface,
      borderColor: colors.danger,
    }),
  },
  selectedContainer: {
    backgroundColor: colors.primary + '1a',
    borderColor: colors.primary,
  },
  todayContainer: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.danger,
  },
  solarText: {
    fontWeight: isToday || isSelected ? 'bold' : '500',
    fontSize: scale(18),
    color: !isCurrentMonth
      ? colors.border
      : isToday
        ? colors.danger
        : isSelected
          ? colors.primary
          : colors.text,
  },
  lunarText: {
    marginTop: 2,
    fontSize: scale(12),
    color: colors.textMuted,
  },
  lunarSpecialText: {
    marginTop: 2,
    fontWeight: '500',
    fontSize: scale(12),
    color: colors.danger,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
    backgroundColor: colors.danger,
  },
});
