import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
import { overlay } from '../../overlay/overlay';
import { getEventsForDate } from '../../core/events';
import { parse } from 'date-fns';
import { t } from '../../core/i18n/t';
import { LunarDate } from '../../core/lunar/convert';

interface DayCellProps {
  dateIso: string;
  solarDay: number;
  lunarInfo: LunarDate;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const DayCell = observer(({ dateIso, solarDay, lunarInfo, isToday, isCurrentMonth }: DayCellProps) => {
  const isSelected = calendar$.selectedDate.get() === dateIso;
  
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
        (isSelected || pressed) && styles.selectedContainer,
        isToday && styles.todayContainer
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
        !isCurrentMonth && styles.outOfMonthText,
        (isToday || isSelected) && styles.highlightText
      ]}>
        {solarDay}
      </Text>
      
      {lunarInfo && (
        <Text style={[
          styles.lunarText,
          (lunarInfo.day === 1 || lunarInfo.day === 15) && styles.lunarSpecialText
        ]}>
          {lunarInfo.day === 1 ? `${lunarInfo.day}/${lunarInfo.month}` : lunarInfo.day}
        </Text>
      )}
      
      {hasEvent && <View style={styles.eventDot} />}
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
    borderColor: '#eee',
  },
  selectedContainer: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  todayContainer: {
    backgroundColor: '#fff0f0',
    borderColor: 'red',
  },
  solarText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  outOfMonthText: {
    color: '#ccc',
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  lunarText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lunarSpecialText: {
    color: 'red',
    fontWeight: '500',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d32f2f',
    position: 'absolute',
    bottom: 4,
  }
});
