import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { format, parse } from 'date-fns';
import { solarToLunar } from '../../core/lunar/convert';
import { getDayCanChi, getYearCanChi, getConflictingBranch } from '../../core/lunar/canChi';
import { MoonPhase } from '../../components/MoonPhase';

type Props = {
  dateIso: string;
};

export const DayDetailSheet: React.FC<Props> = ({ dateIso }) => {
  const solarDate = parse(dateIso, 'yyyy-MM-dd', new Date());
  
  // Calculate Lunar data
  const lunar = solarToLunar(solarDate.getDate(), solarDate.getMonth() + 1, solarDate.getFullYear());
  
  // Calculate Can Chi
  const dayCanChi = getDayCanChi(solarDate);
  const yearCanChi = getYearCanChi(lunar.year);
  const conflictingBranch = getConflictingBranch(dayCanChi.branchIndex);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Chi tiết ngày ${format(solarDate, 'dd/MM/yyyy')}, âm lịch ${lunar.day} tháng ${lunar.month}`}
    >
      <Text style={styles.header} accessibilityRole="header">Chi Tiết Ngày</Text>
      
      <View style={styles.dateBlock}>
        <MoonPhase lunarDay={lunar.day} size={80} />
        <Text style={styles.solarLarge} allowFontScaling={true}>{format(solarDate, 'dd/MM/yyyy')}</Text>
        <Text style={styles.lunarSubtitle} allowFontScaling={true}>
          Âm lịch: {lunar.day}/{lunar.month}/{lunar.year}
        </Text>
      </View>
      
      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày:</Text>
          <Text style={styles.infoValue}>{dayCanChi.canChi}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Năm:</Text>
          <Text style={styles.infoValue}>{yearCanChi}</Text>
        </View>
      </View>
      
      <View style={styles.conflictBlock}>
        <Text style={styles.conflictTitle}>⚠️ Tuổi Xung Khắc (Lục Xung)</Text>
        <Text style={styles.conflictText}>
          Ngày {dayCanChi.canChi} xung khắc với tuổi <Text style={styles.conflictHighlight}>{conflictingBranch}</Text>. 
          Những người tuổi {conflictingBranch} nên cẩn trọng khi ra quyết định lớn trong ngày hôm nay.
        </Text>
      </View>
      
      <Pressable 
        style={styles.closeBtn} 
        onPress={() => overlay.closeModal()}
        accessibilityRole="button"
        accessibilityLabel="Đóng chi tiết ngày"
        accessibilityHint="Nhấn đúp để đóng"
      >
        <Text style={styles.closeBtnText} allowFontScaling={true}>Đóng</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  solarLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  lunarSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoBlock: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  conflictBlock: {
    backgroundColor: '#fff0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  conflictText: {
    fontSize: 14,
    color: '#b71c1c',
    lineHeight: 20,
  },
  conflictHighlight: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  }
});
