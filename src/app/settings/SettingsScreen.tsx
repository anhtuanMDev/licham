import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { settings$ } from '../../state/settings';
import { t } from '../../core/i18n/t';

export const SettingsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const settings = settings$.get();
  
  const toggleLocale = () => {
    settings$.locale.set(settings.locale === 'vi' ? 'en' : 'vi');
  };

  const toggleNotifications = () => {
    settings$.notificationsEnabled.set(!settings.notificationsEnabled);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Cài Đặt</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Ngôn ngữ (Language)</Text>
        <Text style={styles.value} onPress={toggleLocale}>
          {settings.locale.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Nhắc nhở (Notifications)</Text>
        <Switch 
          value={settings.notificationsEnabled} 
          onValueChange={toggleNotifications} 
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  }
});
