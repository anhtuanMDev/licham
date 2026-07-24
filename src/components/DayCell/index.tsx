import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
import { overlay } from '../../overlay/overlay';

interface DayCellProps {
  dateIso: string;
  solarDay: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const DayCell = observer(({ dateIso, solarDay, isToday, isCurrentMonth }: DayCellProps) => {
  // Fine-grained subscription: only re-renders if THIS specific lunar day changes in cache
  const lunarInfo = calendar$.lunarCache[dateIso].get();
  const isSelected = calendar$.selectedDate.get() === dateIso;

  const handlePress = () => {
    calendar$.selectedDate.set(dateIso);
    // Optionally open the detail sheet on press
    overlay.showModal({ type: 'day_detail', props: { dateIso } });
  };

  return (
    <Pressable 
      style={[
        styles.container, 
        isSelected && styles.selectedContainer,
        isToday && styles.todayContainer
      ]} 
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Ngày ${solarDay} tháng dương lịch. ${lunarInfo ? `Ngày ${lunarInfo.day} tháng ${lunarInfo.month} âm lịch.` : ''}`}
      accessibilityHint="Nhấn đúp để xem chi tiết giờ và tuổi xung khắc"
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
  }
});
