import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ViewToken } from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { calendar$ } from '../../state/calendar';
import { settings$ } from '../../state/settings';
import { CalendarGrid } from '../../components/CalendarGrid';
import { overlay } from '../../overlay/overlay';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { t } from '../../core/i18n/t';

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
  
  // We'd dynamically extend this array in a real app when scrolling near the edges
  const MONTH_PAGER_RADIUS = 12;
  const [data] = useState<MonthItem[]>(() => generateMonths(currentMonth.year, currentMonth.month, MONTH_PAGER_RADIUS));

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header" allowFontScaling={true}>
          {t('calendar.month' as any)} {currentMonth.month}, {currentMonth.year}
        </Text>
        <Pressable 
          style={styles.goodDayBtn}
          onPress={() => overlay.showModal({ type: 'good_day_finder' })}
          accessibilityRole="button"
          accessibilityLabel={t('calendar.find_good_day' as any)}
          accessibilityHint={t('calendar.find_good_day_hint' as any)}
        >
          <Text style={styles.goodDayBtnText} allowFontScaling={true}>{t('calendar.find_good_day' as any)}</Text>
        </Pressable>
      </View>
      
      <View style={styles.weekdays}>
        {[
          t('calendar.weekday.t2' as any),
          t('calendar.weekday.t3' as any),
          t('calendar.weekday.t4' as any),
          t('calendar.weekday.t5' as any),
          t('calendar.weekday.t6' as any),
          t('calendar.weekday.t7' as any),
          t('calendar.weekday.cn' as any),
        ].map((d, index) => (
          <Text key={index} style={styles.weekdayText}>{d}</Text>
        ))}
      </View>
      
      <LegendList
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
    backgroundColor: '#fff',
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
  goodDayBtn: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goodDayBtnText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  weekdays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: '#666',
  },
  page: {
    width,
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
