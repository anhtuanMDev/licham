import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { settings$ } from '../../state/settings';
import { t } from '../../core/i18n/t';

import { iapManager } from '../../core/iap/iapManager';

export const SettingsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const settings = settings$.get();
  
  const toggleLocale = () => {
    settings$.locale.set(settings.locale === 'vi' ? 'en' : 'vi');
  };

  const toggleNotifications = () => {
    settings$.notificationsEnabled.set(!settings.notificationsEnabled);
  };

  const handleRestore = () => {
    iapManager.restorePurchases();
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'high-contrast'> = ['light', 'dark', 'high-contrast'];
    const currentIndex = themes.indexOf(settings.theme);
    settings$.theme.set(themes[(currentIndex + 1) % themes.length]);
  };

  const cycleFontScale = () => {
    const scales = [0.8, 1.0, 1.2];
    const currentIndex = scales.indexOf(settings.fontScale) >= 0 ? scales.indexOf(settings.fontScale) : 1;
    settings$.fontScale.set(scales[(currentIndex + 1) % scales.length]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>{t('settings.title')}</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.language')}</Text>
        <Text style={styles.value} onPress={toggleLocale}>
          {settings.locale.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.notifications')}</Text>
        <Switch 
          value={settings.notificationsEnabled} 
          onValueChange={toggleNotifications} 
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Giao diện (Theme)</Text>
        <Pressable hitSlop={10} onPress={cycleTheme} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <Text style={styles.value}>
            {settings.theme === 'light' ? 'SÁNG' : settings.theme === 'dark' ? 'TỐI' : 'TƯƠNG PHẢN CAO'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Cỡ chữ (Font Size)</Text>
        <Pressable hitSlop={10} onPress={cycleFontScale} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <Text style={styles.value}>
            {settings.fontScale === 0.8 ? 'NHỎ' : settings.fontScale === 1.2 ? 'LỚN' : 'BÌNH THƯỜNG'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.row} onPress={handleRestore}>
        <Text style={styles.label}>Khôi phục mua hàng (Restore Purchases)</Text>
        <Text style={styles.value}>›</Text>
      </Pressable>
      
      <View style={styles.premiumBlock}>
        <Text style={styles.premiumTitle}>
          {settings.isPremium ? t('settings.premium.member') : t('settings.premium.upgrade')}
        </Text>
        <Text style={styles.premiumDesc}>
          {settings.isPremium 
            ? t('settings.premium.thanks') 
            : t('settings.premium.desc')}
        </Text>
        {!settings.isPremium && (
          <Pressable 
            style={styles.premiumBtn}
            onPress={() => iapManager.buyPremium()}
          >
            <Text style={styles.premiumBtnText}>{t('settings.premium.buy')}</Text>
          </Pressable>
        )}
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
  },
  premiumBlock: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe066',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b38600',
    marginBottom: 8,
  },
  premiumDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumBtn: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  }
});
