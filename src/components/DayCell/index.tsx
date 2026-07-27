import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
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
  
  // Check for auto-computed holidays
  const events = lunarInfo ? getEventsForDate(parse(dateIso, 'yyyy-MM-dd', new Date()), lunarInfo) : [];
  const hasEvent = events.length > 0;

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
        { borderColor: colors.border },
        (isSelected || pressed) && [styles.selectedContainer, { backgroundColor: colors.primary + '1a', borderColor: colors.primary }],
        isToday && [styles.todayContainer, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]
      ]} 
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${t('calendar.accessibility.day' as any)} ${solarDay} ${t('calendar.accessibility.solar_month' as any)}. ${lunarInfo ? `${t('calendar.accessibility.day' as any)} ${lunarInfo.day} ${t('calendar.accessibility.lunar_month' as any)} ${lunarInfo.month} ${t('calendar.accessibility.lunar' as any)}.` : ''}`}
      accessibilityHint={t('calendar.accessibility.hint' as any)}
    >
      <Text style={[
        styles.solarText,
        { fontSize: scale(18), color: colors.text },
        !isCurrentMonth && [styles.outOfMonthText, { color: colors.border }],
        (isToday || isSelected) && [styles.highlightText, { color: isToday ? colors.danger : colors.primary }]
      ]}>
        {solarDay}
      </Text>
      
      {lunarInfo && (
        <Text style={[
          styles.lunarText,
          { fontSize: scale(12), color: colors.textMuted },
          (lunarInfo.day === 1 || lunarInfo.day === 15) && [styles.lunarSpecialText, { color: colors.danger }]
        ]}>
          {lunarInfo.day === 1 ? `${lunarInfo.day}/${lunarInfo.month}` : lunarInfo.day}
        </Text>
      )}
      
      {hasEvent && <View style={[styles.eventDot, { backgroundColor: colors.danger }]} />}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  selectedContainer: {},
  todayContainer: {},
  solarText: {
    fontWeight: '500',
  },
  outOfMonthText: {},
  highlightText: {
    fontWeight: 'bold',
  },
  lunarText: {
    marginTop: 2,
  },
  lunarSpecialText: {
    fontWeight: '500',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  }
});
