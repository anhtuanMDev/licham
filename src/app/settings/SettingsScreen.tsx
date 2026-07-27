import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { settings$ } from '../../state/settings';
import { t } from '../../core/i18n/t';
import { iapManager } from '../../core/iap/iapManager';
import { useAppTheme } from '../../core/theme';
import { overlay } from '../../overlay/overlay';
import { useMemo } from 'react';

export const SettingsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const settings = settings$.get();
  const { colors, scale, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, scale, isDark, insets), [colors, scale, isDark, insets]);

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
        <View style={styles.premiumCardActive}>
          <Text style={styles.premiumCardTitleActive}>
            {t('settings.premium.member' as any)}
          </Text>
          <Text style={styles.premiumCardDescActive}>
            {t('settings.premium.thanks' as any)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.premiumCardInactive}>
        <Text style={styles.premiumCardTitleInactive}>
          {t('settings.premium.upgrade' as any)}
        </Text>
        <Text style={styles.premiumCardDescInactive}>
          {t('settings.premium.desc' as any)}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.premiumBtn,
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => iapManager.buyPremium()}
        >
          <Text style={styles.premiumBtnText}>
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
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.rowValueContainer}>
          {valueElement}
        </View>
      </View>
    );

    const containerStyle = [
      styles.rowContainer,
      !isLast && styles.rowContainerNotLast
    ];

    if (onPress) {
      return (
        <Pressable style={({ pressed }) => [containerStyle, pressed && styles.rowContainerPressed]} onPress={onPress}>
          {content}
        </Pressable>
      );
    }
    return <View style={containerStyle}>{content}</View>;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.header}>
        {t('settings.title')}
      </Text>

      {renderPremiumBlock()}

      <Text style={styles.sectionHeader}>
        {t('settings.general')}
      </Text>
      <View style={styles.sectionBlock}>
        {renderRow(
          t('settings.language'),
          <Text style={styles.rowValueText}>
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

      <Text style={styles.sectionHeader}>
        {t('settings.appearance')}
      </Text>
      <View style={styles.sectionBlock}>
        {renderRow(
          t('settings.theme'),
          <Text style={styles.rowValueText}>
            {settings.theme === 'light' ? t('settings.theme.light') : settings.theme === 'dark' ? t('settings.theme.dark') : t('settings.theme.high_contrast')}
          </Text>,
          cycleTheme
        )}
        {renderRow(
          t('settings.fontSize'),
          <Text style={styles.rowValueText}>
            {settings.fontScale === 0.8 ? t('settings.font.small') : settings.fontScale === 1.2 ? t('settings.font.large') : t('settings.font.normal')}
          </Text>,
          cycleFontScale,
          true
        )}
      </View>

      <Text style={styles.sectionHeader}>
        {t('settings.purchases')}
      </Text>
      <View style={styles.sectionBlock}>
        {renderRow(
          t('settings.restorePurchases'),
          <Text style={styles.rowValueText}>
            {t('settings.restore')}
          </Text>,
          handleRestore,
          true
        )}
      </View>
    </ScrollView>
  );
});

const createStyles = (colors: any, scale: (size: number) => number, isDark: boolean, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: insets.top + 10,
    paddingBottom: 40,
  },
  header: {
    fontWeight: '700',
    paddingHorizontal: 8,
    marginBottom: 16,
    fontSize: scale(32),
    color: colors.text,
  },
  premiumCardActive: {
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: colors.primary,
  },
  premiumCardInactive: {
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  premiumCardTitleActive: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    fontSize: scale(20),
  },
  premiumCardTitleInactive: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: scale(20),
    color: colors.text,
  },
  premiumCardDescActive: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 20,
    fontSize: scale(15),
  },
  premiumCardDescInactive: {
    lineHeight: 22,
    marginBottom: 20,
    fontSize: scale(15),
    color: colors.textMuted,
  },
  premiumBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  premiumBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: scale(16),
  },
  sectionHeader: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 8,
    marginBottom: 6,
    marginTop: 16,
    fontSize: scale(13),
    color: colors.textMuted,
  },
  sectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
  },
  rowContainer: {
    paddingLeft: 8,
    backgroundColor: colors.surface,
  },
  rowContainerNotLast: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowContainerPressed: {
    backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
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
    fontSize: scale(17),
    color: colors.text,
  },
  rowValueContainer: {
    flexShrink: 0,
    paddingLeft: 16,
  },
  rowValueText: {
    fontWeight: '500',
    fontSize: scale(17),
    color: colors.primary,
  }
});
