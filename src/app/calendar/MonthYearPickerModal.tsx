import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { observer } from '@legendapp/state/react';
import { overlay } from '../../overlay/overlay';
import { calendar$ } from '../../state/calendar';
import { t } from '../../core/i18n/t';

export const MonthYearPickerModal = observer(() => {
  const current = calendar$.visibleMonth.get();
  const [selectedYear, setSelectedYear] = useState(current.year);
  const [selectedMonth, setSelectedMonth] = useState(current.month);

  const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1900 to 2100
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const yearListRef = useRef<FlatList>(null);

  useEffect(() => {
    const index = years.indexOf(selectedYear);
    if (index !== -1 && yearListRef.current) {
      setTimeout(() => {
        yearListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
      }, 100);
    }
  }, []);

  const handleDone = () => {
    calendar$.jumpDate.set({ year: selectedYear, month: selectedMonth });
    overlay.closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('calendar.select_month_year' as any)}</Text>

      <Text style={styles.sectionLabel}>{t('calendar.year_label' as any)}</Text>
      <View style={styles.yearContainer}>
        <FlatList
          ref={yearListRef}
          data={years}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.yearItem, selectedYear === item && styles.yearItemSelected]}
              onPress={() => setSelectedYear(item)}
            >
              <Text style={[styles.yearText, selectedYear === item && styles.yearTextSelected]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <Text style={styles.sectionLabel}>{t('calendar.month' as any)}</Text>
      <View style={styles.monthGrid}>
        {months.map((m) => (
          <Pressable
            key={m}
            style={[styles.monthItem, selectedMonth === m && styles.monthItemSelected]}
            onPress={() => setSelectedMonth(m)}
          >
            <Text style={[styles.monthText, selectedMonth === m && styles.monthTextSelected]}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cancelBtn} onPress={() => overlay.closeModal()}>
          <Text style={styles.cancelBtnText}>{t('common.cancel' as any)}</Text>
        </Pressable>
        <Pressable style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>{t('common.done' as any)}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginTop: 10,
  },
  yearContainer: {
    height: 50,
    marginBottom: 20,
  },
  yearItem: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  yearItemSelected: {
    backgroundColor: '#007AFF',
  },
  yearText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  yearTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  monthItemSelected: {
    backgroundColor: '#007AFF',
  },
  monthText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  monthTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  }
});
