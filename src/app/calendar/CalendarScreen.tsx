import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ViewToken } from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
import { settings$ } from '../../state/settings';
import { CalendarGrid } from '../../components/CalendarGrid';
import { overlay } from '../../overlay/overlay';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getCanChiYear } from '../../core/lunar/convert';
import { t } from '../../core/i18n/t';
import { MonthEventList } from '../../components/MonthEventList';
import { useAppTheme } from '../../core/theme';

const { width } = Dimensions.get('window');

type MonthItem = {
  id: string;
  year: number;
  month: number;
};

// Pre-generate a list of months around the current date to scroll through
const generateMonths = (centerYear: number, centerMonth: number, radius: number): MonthItem[] => {
  const months: MonthItem[] = [];
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
  const isPremium = settings$.isPremium.get();
  const { colors, scale } = useAppTheme();
  
  // We'd dynamically extend this array in a real app when scrolling near the edges
  const MONTH_PAGER_RADIUS = 12;
  const jumpDate = calendar$.jumpDate.get();
  
  const [baseDate, setBaseDate] = useState(() => {
    if (jumpDate) {
      return { year: jumpDate.year, month: jumpDate.month };
    }
    return { year: currentMonth.year, month: currentMonth.month };
  });

  useEffect(() => {
    if (jumpDate) {
      setBaseDate(jumpDate);
      calendar$.visibleMonth.set(jumpDate);
      calendar$.jumpDate.set(null); // Reset it so it can be fired again
    }
  }, [jumpDate]);

  const data = useMemo(() => generateMonths(baseDate.year, baseDate.month, MONTH_PAGER_RADIUS), [baseDate.year, baseDate.month]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visible = viewableItems[0]?.item as MonthItem | undefined;
      if (visible) {
        calendar$.visibleMonth.set({ year: visible.year, month: visible.month });
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 51 }).current;
  
  const renderItem = ({ item }: { item: MonthItem }) => (
    <View style={styles.page}>
      <CalendarGrid year={item.year} month={item.month} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => overlay.showModal({ type: 'month_year_picker' })}>
          <Text style={[styles.headerTitle, { fontSize: scale(20), color: colors.text }]} accessibilityRole="header" allowFontScaling={true}>
            {t('calendar.month' as any)} {currentMonth.month}, {currentMonth.year}
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: scale(14), color: colors.primary, marginTop: 4 }]} allowFontScaling={true}>
            Năm {getCanChiYear(currentMonth.year)}
          </Text>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.addBtn, { backgroundColor: colors.primary + '20' }]} 
            onPress={() => overlay.showModal({ type: 'reminder_edit', props: {} })}
            accessibilityRole="button"
          >
            <Text style={[styles.addBtnText, { color: colors.primary, fontSize: scale(18) }]} allowFontScaling={true}>+</Text>
          </Pressable>
          <Pressable 
            style={[styles.goodDayBtn, { backgroundColor: colors.primary + '20' }]} // 20 hex for 12% opacity
            onPress={() => overlay.showModal({ type: 'good_day_finder' })}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.find_good_day' as any)}
            accessibilityHint={t('calendar.find_good_day_hint' as any)}
          >
            <Text style={[styles.goodDayBtnText, { color: colors.primary, fontSize: scale(14) }]} allowFontScaling={true}>{t('calendar.find_good_day' as any)}</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={[styles.weekdays, { borderColor: colors.border }]}>
        {[
          t('calendar.weekday.t2' as any),
          t('calendar.weekday.t3' as any),
          t('calendar.weekday.t4' as any),
          t('calendar.weekday.t5' as any),
          t('calendar.weekday.t6' as any),
          t('calendar.weekday.t7' as any),
          t('calendar.weekday.cn' as any),
        ].map((d, index) => (
          <Text key={index} style={[styles.weekdayText, { color: colors.textMuted, fontSize: scale(14) }]}>{d}</Text>
        ))}
      </View>
      
      <View style={styles.calendarContainer}>
        <LegendList
          key={`${baseDate.year}-${baseDate.month}`}
          data={data}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          estimatedItemSize={width}
          keyExtractor={(item: MonthItem) => item.id}
          showsHorizontalScrollIndicator={false}
          initialScrollOffset={width * MONTH_PAGER_RADIUS}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>

      <MonthEventList />
      
      {!isPremium && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontWeight: 'bold',
    marginTop: -2,
  },
  goodDayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goodDayBtnText: {
    fontWeight: '600',
  },
  weekdays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  page: {
    width,
  },
  calendarContainer: {
    // Allows the LegendList to wrap its content height instead of expanding
  },
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    minHeight: 50,
  }
});
