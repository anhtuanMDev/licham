import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from '@legendapp/state/react';
import { overlay } from '../../overlay/overlay';
import { calendar$ } from '../../state/calendar';
import { t } from '../../core/i18n/t';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export const MonthYearPickerModal = observer(() => {
  const current = calendar$.visibleMonth.get();
  const [selectedYear, setSelectedYear] = useState(current.year);
  const [selectedMonth, setSelectedMonth] = useState(current.month);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDone = () => {
    calendar$.jumpDate.set({ year: selectedYear, month: selectedMonth });
    overlay.closeModal();
  };

  const handlePrevYear = () => {
    setSelectedYear(prev => Math.max(1900, prev - 1));
  };

  const handleNextYear = () => {
    setSelectedYear(prev => Math.min(2100, prev + 1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('calendar.select_month_year')}</Text>

      {/* Year Selector */}
      <View style={styles.yearSelector}>
        <Pressable style={styles.yearBtn} onPress={handlePrevYear} hitSlop={10}>
          <ChevronLeft color="#007AFF" size={24} />
        </Pressable>
        
        <Text style={styles.yearText}>{selectedYear}</Text>
        
        <Pressable style={styles.yearBtn} onPress={handleNextYear} hitSlop={10}>
          <ChevronRight color="#007AFF" size={24} />
        </Pressable>
      </View>

      {/* Month Grid */}
      <View style={styles.monthGrid}>
        {months.map((m) => (
          <Pressable
            key={m}
            style={[styles.monthItem, selectedMonth === m && styles.monthItemSelected]}
            onPress={() => setSelectedMonth(m)}
          >
            <Text style={[styles.monthText, selectedMonth === m && styles.monthTextSelected]}>
              Th {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [styles.textBtn, pressed && styles.btnPressed]} 
          onPress={() => overlay.closeModal()}
        >
          <Text style={styles.textBtnLabel}>{t('common.cancel')}</Text>
        </Pressable>
        <Pressable 
          style={({ pressed }) => [styles.textBtn, pressed && styles.btnPressed]} 
          onPress={handleDone}
        >
          <Text style={styles.textBtnLabel}>{t('common.done')}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  yearBtn: {
    padding: 8,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginHorizontal: 24,
    width: 60,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  monthItem: {
    width: '30%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  monthItemSelected: {
    backgroundColor: '#007AFF',
  },
  monthText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '400',
  },
  monthTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 8,
  },
  btnPressed: {
    opacity: 0.6,
  },
  textBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  }
});
