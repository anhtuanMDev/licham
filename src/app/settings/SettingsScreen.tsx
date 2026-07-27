import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { settings$ } from '../../state/settings';
import { t } from '../../core/i18n/t';
import { iapManager } from '../../core/iap/iapManager';
import { useAppTheme } from '../../core/theme';
import { overlay } from '../../overlay/overlay';

export const SettingsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const settings = settings$.get();
  const { colors, scale, isDark } = useAppTheme();

  const toggleNotifications = () => {
    settings$.notificationsEnabled.set(!settings.notificationsEnabled);
  };

  const toggleLocale = () => {
    const next = settings.locale === 'vi' ? 'en' : 'vi';
    settings$.locale.set(next);
  };

  const handleRestore = async () => {
    overlay.showToast('Đang khôi phục...');
    await iapManager.verifyPurchases();
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'high-contrast'] as const;
    const currentIdx = themes.indexOf(settings.theme);
    settings$.theme.set(themes[(currentIdx + 1) % themes.length]);
  };

  const cycleFontScale = () => {
    const scales = [0.8, 1, 1.2];
    const currentIdx = scales.indexOf(settings.fontScale);
    settings$.fontScale.set(scales[(currentIdx + 1) % scales.length]);
  };

  const renderPremiumBlock = () => {
    if (settings.isPremium) {
      return (
        <View style={[styles.premiumCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.premiumCardTitle, { fontSize: scale(20) }]}>
            {t('settings.premium.member' as any)}
          </Text>
          <Text style={[styles.premiumCardDesc, { fontSize: scale(15) }]}>
            {t('settings.premium.thanks' as any)}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.premiumCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
        <Text style={[styles.premiumCardTitle, { fontSize: scale(20), color: colors.text }]}>
          {t('settings.premium.upgrade' as any)}
        </Text>
        <Text style={[styles.premiumCardDesc, { fontSize: scale(15), color: colors.textMuted }]}>
          {t('settings.premium.desc' as any)}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.premiumBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => iapManager.buyPremium()}
        >
          <Text style={[styles.premiumBtnText, { fontSize: scale(16) }]}>
            {t('settings.premium.buy' as any)}
          </Text>
        </Pressable>
      </View>
    );
  };

  // Helper to render the common row structure
  const renderRow = (
    label: string,
    valueElement: React.ReactNode,
    onPress?: () => void,
    isLast: boolean = false
  ) => {
    const content = (
      <View style={styles.rowInner}>
        <Text style={[styles.rowLabel, { fontSize: scale(17), color: colors.text }]}>{label}</Text>
        <View style={styles.rowValueContainer}>
          {valueElement}
        </View>
      </View>
    );

    const containerStyle = [
      styles.rowContainer,
      { backgroundColor: colors.surface },
      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
    ];

    if (onPress) {
      return (
        <Pressable style={({ pressed }) => [containerStyle, pressed && { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]} onPress={onPress}>
          {content}
        </Pressable>
      );
    }
    return <View style={containerStyle}>{content}</View>;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 40 }}
    >
      <Text style={[styles.header, { fontSize: scale(32), color: colors.text }]}>
        {t('settings.title')}
      </Text>

      {renderPremiumBlock()}

      <Text style={[styles.sectionHeader, { fontSize: scale(13), color: colors.textMuted }]}>
        {t('settings.general')}
      </Text>
      <View style={[styles.sectionBlock, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        {renderRow(
          t('settings.language'),
          <Text style={[styles.rowValueText, { fontSize: scale(17), color: colors.primary }]}>
            {settings.locale === 'vi' ? 'Tiếng Việt' : 'English'}
          </Text>,
          toggleLocale
        )}
        {renderRow(
          t('settings.notifications'),
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ true: colors.primary }}
          />,
          undefined,
          true
        )}
      </View>

      <Text style={[styles.sectionHeader, { fontSize: scale(13), color: colors.textMuted }]}>
        {t('settings.appearance')}
      </Text>
      <View style={[styles.sectionBlock, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        {renderRow(
          t('settings.theme'),
          <Text style={[styles.rowValueText, { fontSize: scale(17), color: colors.primary }]}>
            {settings.theme === 'light' ? 'Sáng' : settings.theme === 'dark' ? 'Tối' : 'Tương phản cao'}
          </Text>,
          cycleTheme
        )}
        {renderRow(
          t('settings.fontSize'),
          <Text style={[styles.rowValueText, { fontSize: scale(17), color: colors.primary }]}>
            {settings.fontScale === 0.8 ? 'Nhỏ' : settings.fontScale === 1.2 ? 'Lớn' : 'Bình thường'}
          </Text>,
          cycleFontScale,
          true
        )}
      </View>

      <Text style={[styles.sectionHeader, { fontSize: scale(13), color: colors.textMuted }]}>
        {t('settings.purchases')}
      </Text>
      <View style={[styles.sectionBlock, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        {renderRow(
          t('settings.restorePurchases'),
          <Text style={[styles.rowValueText, { fontSize: scale(17), color: colors.primary }]}>
            {t('settings.restore')}
          </Text>,
          handleRestore,
          true
        )}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontWeight: '700',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  premiumCard: {
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumCardTitle: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  premiumCardDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 20,
  },
  premiumBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionHeader: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 8,
    marginBottom: 6,
    marginTop: 16,
  },
  sectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContainer: {
    paddingLeft: 8,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 8,
  },
  rowLabel: {
    fontWeight: '400',
    flex: 1,
  },
  rowValueContainer: {
    flexShrink: 0,
    paddingLeft: 16,
  },
  rowValueText: {
    fontWeight: '500',
  }
});
