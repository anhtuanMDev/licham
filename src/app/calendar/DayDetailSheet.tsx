import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { format, parse } from 'date-fns';
import { solarToLunar } from '../../core/lunar/convert';
import { getDayCanChi, getYearCanChi, getConflictingBranch } from '../../core/lunar/canChi';
import { getEventsForDate } from '../../core/events';
import { MoonPhase } from '../../components/MoonPhase';
import { t } from '../../core/i18n/t';
import { useAppTheme } from '../../core/theme';
import { observer } from '@legendapp/state/react';

type Props = {
  dateIso: string;
};

export const DayDetailSheet: React.FC<Props> = observer(({ dateIso }) => {
  const { colors, scale } = useAppTheme();
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
      style={[styles.container, { backgroundColor: colors.background }]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${t('calendar.day_detail_title' as any)} ${format(solarDate, 'dd/MM/yyyy')}, ${t('calendar.lunar_date_prefix' as any)} ${lunar.day} ${t('calendar.accessibility.lunar_month' as any)} ${lunar.month}`}
    >
      <Text style={[styles.header, { fontSize: scale(20), color: colors.text }]} accessibilityRole="header">{t('calendar.day_detail_title' as any)}</Text>
      
      <View style={styles.dateBlock}>
        <MoonPhase lunarDay={lunar.day} size={80} />
        <Text style={[styles.solarLarge, { fontSize: scale(32), color: colors.text }]} allowFontScaling={true}>{format(solarDate, 'dd/MM/yyyy')}</Text>
        <Text style={[styles.lunarSubtitle, { fontSize: scale(16), color: colors.textMuted }]} allowFontScaling={true}>
          {t('calendar.lunar_date_prefix' as any)}: {lunar.day}/{lunar.month}/{lunar.year}
        </Text>
      </View>
      
      <View style={[styles.infoBlock, { backgroundColor: colors.surface }]}>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { fontSize: scale(16), color: colors.textMuted }]}>{t('calendar.day_label' as any)}:</Text>
          <Text style={[styles.infoValue, { fontSize: scale(16), color: colors.text }]}>{dayCanChi.canChi}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { fontSize: scale(16), color: colors.textMuted }]}>{t('calendar.year_label' as any)}:</Text>
          <Text style={[styles.infoValue, { fontSize: scale(16), color: colors.text }]}>{yearCanChi}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { fontSize: scale(16), color: colors.textMuted }]}>{t('calendar.conflict_label' as any)}:</Text>
          <Text style={[styles.infoValue, { fontSize: scale(16), color: colors.text }]}>{conflictingBranch}</Text>
        </View>
      </View>
      
      {events.length > 0 && (
        <View style={[styles.eventBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eventTitle, { fontSize: scale(16), color: colors.primary }]}>{t('event.title' as any)}</Text>
          {events.map((eventKey, idx) => (
            <Text key={idx} style={[styles.eventText, { fontSize: scale(15), color: colors.text }]}>• {t(eventKey)}</Text>
          ))}
        </View>
      )}
      
      <Pressable 
        style={({ pressed }) => [
          styles.closeBtn,
          { backgroundColor: colors.surface },
          pressed && { opacity: 0.8 }
        ]} 
        onPress={() => overlay.closeModal()}
        accessibilityRole="button"
        accessibilityLabel={t('calendar.close' as any)}
        accessibilityHint={t('calendar.close' as any)}
      >
        <Text style={[styles.closeBtnText, { fontSize: scale(16), color: colors.text }]} allowFontScaling={true}>{t('calendar.close' as any)}</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  solarLarge: {
    fontWeight: 'bold',
  },
  lunarSubtitle: {
    marginTop: 4,
  },
  infoBlock: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {},
  infoValue: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventBlock: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  eventTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventText: {
    lineHeight: 22,
    marginBottom: 4,
  },
  closeBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtnText: {
    fontWeight: '600',
  }
});
