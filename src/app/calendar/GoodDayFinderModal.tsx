import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { findGoodDays, GoodDayResult } from '../../core/lunar/hoangDao';
import { format } from 'date-fns';

export const GoodDayFinderModal: React.FC = () => {
  const [results, setResults] = useState<GoodDayResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [purpose, setPurpose] = useState<'any' | 'wedding' | 'moving'>('any');

  const handleSearch = () => {
    // Search next 30 days starting from tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const goodDays = findGoodDays(tomorrow, 30, purpose);
    setResults(goodDays);
    setHasSearched(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tìm Ngày Tốt</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Mục đích:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <Pressable 
            style={[styles.chip, purpose === 'any' && styles.chipActive]}
            onPress={() => setPurpose('any')}>
            <Text style={[styles.chipText, purpose === 'any' && styles.chipTextActive]}>Mọi việc</Text>
          </Pressable>
          <Pressable 
            style={[styles.chip, purpose === 'wedding' && styles.chipActive]}
            onPress={() => setPurpose('wedding')}>
            <Text style={[styles.chipText, purpose === 'wedding' && styles.chipTextActive]}>Cưới hỏi</Text>
          </Pressable>
          <Pressable 
            style={[styles.chip, purpose === 'moving' && styles.chipActive]}
            onPress={() => setPurpose('moving')}>
            <Text style={[styles.chipText, purpose === 'moving' && styles.chipTextActive]}>Nhập trạch</Text>
          </Pressable>
        </ScrollView>
      </View>
      
      <Pressable style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchBtnText}>Tìm trong 30 ngày tới</Text>
      </Pressable>
      
      {hasSearched && (
        <ScrollView style={styles.resultsContainer}>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>Không tìm thấy ngày phù hợp.</Text>
          ) : (
            results.map((r, i) => (
              <View key={i} style={styles.resultCard}>
                <View style={styles.resultLeft}>
                  <Text style={styles.solarText}>{format(r.solarDate, 'dd/MM/yyyy')}</Text>
                  <Text style={styles.lunarText}>Âm lịch: {r.lunarDate.day}/{r.lunarDate.month}</Text>
                </View>
                <View style={styles.resultRight}>
                  <Text style={styles.reasonText}>{r.reason}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      
      <Pressable style={styles.closeBtn} onPress={() => overlay.closeModal()}>
        <Text style={styles.closeBtnText}>Đóng</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%', // limit height if many results
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginRight: 12,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBtn: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  resultCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  resultLeft: {
    flex: 1,
  },
  solarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lunarText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  resultRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  reasonText: {
    fontSize: 13,
    color: '#4caf50', // green for good day
    fontWeight: '500',
    textAlign: 'right',
  },
  closeBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#666',
  }
});
