import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { observer } from '@legendapp/state/react';
import { format } from 'date-fns';
import { DayCell } from '../DayCell';
import { calendar$ } from '../../state/calendar';
import { solarToLunar } from '../../core/lunar/convert';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
}

export const CalendarGrid = observer(({ year, month }: CalendarGridProps) => {
  // Generate the 42-cell grid for the given month
  const grid = React.useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon-Sun
    
    const cells = [];
    const current = new Date(year, month - 1, 1 - startOffset);
    
    for (let i = 0; i < 42; i++) {
      const dateIso = format(current, 'yyyy-MM-dd');
      cells.push({
        dateIso,
        solarDay: current.getDate(),
        isCurrentMonth: current.getMonth() === month - 1,
        dateObj: new Date(current), // Clone
      });
      current.setDate(current.getDate() + 1);
    }
    return cells;
  }, [year, month]);

  // Pre-populate lunar cache for this grid
  useEffect(() => {
    const cache = calendar$.lunarCache.get();
    let updated = false;
    
    grid.forEach(cell => {
      if (!cache[cell.dateIso]) {
        const d = cell.dateObj;
        calendar$.lunarCache[cell.dateIso].set(
          solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear())
        );
      }
    });
  }, [grid]);

  const todayIso = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.grid}>
      {grid.map((cell) => (
        <View key={cell.dateIso} style={styles.cellWrapper}>
          <DayCell 
            dateIso={cell.dateIso}
            solarDay={cell.solarDay}
            isCurrentMonth={cell.isCurrentMonth}
            isToday={cell.dateIso === todayIso}
          />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cellWrapper: {
    width: '14.28%', // 100 / 7
  }
});
