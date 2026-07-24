import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { CalendarScreen } from './src/app/calendar/CalendarScreen';
import { RemindersScreen } from './src/app/reminders/RemindersScreen';
import { SettingsScreen } from './src/app/settings/SettingsScreen';
import { OverlayHost } from './src/overlay/OverlayHost';
import { ToastHost } from './src/overlay/ToastHost';
import { midnightTicker } from './src/scheduling/midnightTicker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [tab, setTab] = useState<'calendar' | 'reminders' | 'settings'>('calendar');

  useEffect(() => {
    midnightTicker.start();

    return () => {
      midnightTicker.stop();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {tab === 'calendar' && <CalendarScreen />}
          {tab === 'reminders' && <RemindersScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </View>

        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => setTab('calendar')}>
            <Text style={[styles.tabText, tab === 'calendar' && styles.activeTabText]}>Lịch</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => setTab('reminders')}>
            <Text style={[styles.tabText, tab === 'reminders' && styles.activeTabText]}>Nhắc Nhở</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => setTab('settings')}>
            <Text style={[styles.tabText, tab === 'settings' && styles.activeTabText]}>Cài Đặt</Text>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 20, // safe area padding placeholder
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  }
});

export default App;
