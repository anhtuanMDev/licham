import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { format, parse } from 'date-fns';
import { solarToLunar } from '../../core/lunar/convert';
import { getDayCanChi, getYearCanChi, getConflictingBranch } from '../../core/lunar/canChi';
import { getEventsForDate } from '../../core/events';
import { MoonPhase } from '../../components/MoonPhase';
import { t } from '../../core/i18n/t';

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
  
  // Calculate Events
  const events = getEventsForDate(solarDate, lunar);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${t('calendar.day_detail_title' as any)} ${format(solarDate, 'dd/MM/yyyy')}, ${t('calendar.lunar_date_prefix' as any)} ${lunar.day} ${t('calendar.accessibility.lunar_month' as any)} ${lunar.month}`}
    >
      <Text style={styles.header} accessibilityRole="header">{t('calendar.day_detail_title' as any)}</Text>
      
      <View style={styles.dateBlock}>
        <MoonPhase lunarDay={lunar.day} size={80} />
        <Text style={styles.solarLarge} allowFontScaling={true}>{format(solarDate, 'dd/MM/yyyy')}</Text>
        <Text style={styles.lunarSubtitle} allowFontScaling={true}>
          {t('calendar.lunar_date_prefix' as any)}: {lunar.day}/{lunar.month}/{lunar.year}
        </Text>
      </View>
      
      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('calendar.day_label' as any)}:</Text>
          <Text style={styles.infoValue}>{dayCanChi.canChi}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('calendar.year_label' as any)}:</Text>
          <Text style={styles.infoValue}>{yearCanChi}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('calendar.conflict_label' as any)}:</Text>
          <Text style={styles.infoValue}>{conflictingBranch}</Text>
        </View>
      </View>
      
      {events.length > 0 && (
        <View style={styles.eventBlock}>
          <Text style={styles.eventTitle}>{t('event.title' as any)}</Text>
          {events.map((eventKey, idx) => (
            <Text key={idx} style={styles.eventText}>• {t(eventKey)}</Text>
          ))}
        </View>
      )}
      
      <Pressable 
        style={styles.closeBtn} 
        onPress={() => overlay.closeModal()}
        accessibilityRole="button"
        accessibilityLabel={t('calendar.close' as any)}
        accessibilityHint={t('calendar.close' as any)}
      >
        <Text style={styles.closeBtnText} allowFontScaling={true}>{t('calendar.close' as any)}</Text>
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
  eventBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 4,
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
