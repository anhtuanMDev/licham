import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
import { CalendarGrid } from '../../components/CalendarGrid';

const { width } = Dimensions.get('window');

// Pre-generate a list of months around the current date to scroll through
const generateMonths = (centerYear: number, centerMonth: number, radius: number) => {
  const months = [];
  for (let i = -radius; i <= radius; i++) {
    const date = new Date(centerYear, centerMonth - 1 + i, 1);
    months.push({
      id: `${date.getFullYear()}-${date.getMonth() + 1}`,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }
  return months;
};

export const CalendarScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const currentMonth = calendar$.visibleMonth.get();
  
  // We'd dynamically extend this array in a real app when scrolling near the edges
  const [data] = useState(() => generateMonths(currentMonth.year, currentMonth.month, 12));
  
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.page}>
      <CalendarGrid year={item.year} month={item.month} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tháng {currentMonth.month}, {currentMonth.year}</Text>
      </View>
      
      <View style={styles.weekdays}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <Text key={d} style={styles.weekdayText}>{d}</Text>
        ))}
      </View>
      
      <LegendList
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        estimatedItemSize={width}
        keyExtractor={(item: any) => item.id}
        showsHorizontalScrollIndicator={false}
        // initialScrollIndex to center on the current month would be added here
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekdays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: '#666',
  },
  page: {
    width,
  }
});
