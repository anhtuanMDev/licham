import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
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
      <Text style={styles.header}>{t('settings.title' as any)}</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.language' as any)}</Text>
        <Text style={styles.value} onPress={toggleLocale}>
          {settings.locale.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>{t('settings.notifications' as any)}</Text>
        <Switch 
          value={settings.notificationsEnabled} 
          onValueChange={toggleNotifications} 
        />
      </View>
      
      <View style={styles.premiumBlock}>
        <Text style={styles.premiumTitle}>
          {settings.isPremium ? t('settings.premium.member' as any) : t('settings.premium.upgrade' as any)}
        </Text>
        <Text style={styles.premiumDesc}>
          {settings.isPremium 
            ? t('settings.premium.thanks' as any) 
            : t('settings.premium.desc' as any)}
        </Text>
        {!settings.isPremium && (
          <Pressable 
            style={styles.premiumBtn}
            onPress={() => settings$.isPremium.set(true)}
          >
            <Text style={styles.premiumBtnText}>{t('settings.premium.buy' as any)}</Text>
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
