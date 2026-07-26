import React from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { format } from 'date-fns';
import { DayCell } from '../DayCell';
import { calendar$ } from '../../state/calendar';
import { solarToLunar, LunarDate } from '../../core/lunar/convert';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
}

export const CalendarGrid = observer(({ year, month }: CalendarGridProps) => {
  // Generate the 42-cell grid and compute lunar dates synchronously
  const grid = React.useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon-Sun
    
    const cells = [];
    const current = new Date(year, month - 1, 1 - startOffset);
    
    for (let i = 0; i < 42; i++) {
      const dateIso = format(current, 'yyyy-MM-dd');
      const dd = current.getDate();
      const mm = current.getMonth() + 1;
      const yy = current.getFullYear();

      // Compute lunar date synchronously — no cache, no useEffect race
      const lunar = solarToLunar(dd, mm, yy);

      // Also populate the observable cache for other consumers (DayDetailSheet, etc.)
      calendar$.lunarCache[dateIso].set(lunar);

      cells.push({
        dateIso,
        solarDay: dd,
        isCurrentMonth: current.getMonth() === month - 1,
        lunar,
      });
      current.setDate(current.getDate() + 1);
    }
    return cells;
  }, [year, month]);

  const todayIso = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.grid}>
      {grid.map((cell) => (
        <View key={cell.dateIso} style={styles.cellWrapper}>
          <DayCell 
            dateIso={cell.dateIso}
            solarDay={cell.solarDay}
            lunarInfo={cell.lunar}
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
