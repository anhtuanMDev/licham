import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { CalendarScreen } from './src/app/calendar/CalendarScreen';
import { RemindersScreen } from './src/app/reminders/RemindersScreen';
import { SettingsScreen } from './src/app/settings/SettingsScreen';
import { OverlayHost } from './src/overlay/OverlayHost';
import { ToastHost } from './src/overlay/ToastHost';
import { midnightTicker } from './src/scheduling/midnightTicker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { iapManager } from './src/core/iap/iapManager';
import { useAppTheme } from './src/core/theme';
import { useSelector } from '@legendapp/state/react';
import { ui$ } from './src/state/ui';
import { t } from './src/core/i18n/t';

const App = () => {
  const tab = useSelector(() => ui$.activeTab.get());

  const { colors, scale } = useAppTheme();

  useEffect(() => {
    midnightTicker.start();
    iapManager.init();

    return () => {
      midnightTicker.stop();
      iapManager.destroy();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {tab === 'calendar' && <CalendarScreen />}
          {tab === 'reminders' && <RemindersScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </View>

        <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable style={styles.tabItem} onPress={() => ui$.activeTab.set('calendar')}>
            <Text style={[styles.tabText, { fontSize: scale(16) }, tab === 'calendar' && [styles.activeTabText, { color: colors.primary }]]}>{t('common.calendar')}</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => ui$.activeTab.set('reminders')}>
            <Text style={[styles.tabText, { fontSize: scale(16) }, tab === 'reminders' && [styles.activeTabText, { color: colors.primary }]]}>{t('reminders.title')}</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => ui$.activeTab.set('settings')}>
            <Text style={[styles.tabText, { fontSize: scale(16) }, tab === 'settings' && [styles.activeTabText, { color: colors.primary }]]}>{t('settings.title')}</Text>
          </Pressable>
        </View>

        {/* Global Overlays */}
        <OverlayHost />
        <ToastHost />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 20, // safe area padding placeholder
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    color: '#999',
  },
  activeTabText: {
    fontWeight: 'bold',
  }
});

export default App;
