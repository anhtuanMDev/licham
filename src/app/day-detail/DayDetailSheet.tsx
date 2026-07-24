import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';

export const DayDetailSheet = observer(({ dateIso }: { dateIso: string }) => {
  const lunarInfo = calendar$.lunarCache[dateIso].get();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết ngày {dateIso}</Text>
      
      {lunarInfo ? (
        <View style={styles.details}>
          <Text style={styles.infoText}>Ngày Âm: {lunarInfo.day}/{lunarInfo.month}/{lunarInfo.year}</Text>
          <Text style={styles.infoText}>Can Chi: (TODO)</Text>
          <Text style={styles.infoText}>Tiết Khí: (TODO)</Text>
        </View>
      ) : (
        <Text>Đang tải dữ liệu âm lịch...</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  details: {
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  }
});
