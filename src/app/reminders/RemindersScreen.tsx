import { LegendList } from '@legendapp/list/react-native';
import { observer } from '@legendapp/state/react';
import React from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions } from '../../state/reminders';
import { useAppTheme } from '../../core/theme';
import { t } from '../../core/i18n/t';

export const RemindersScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const reminders = reminders$.get();
  const { colors, scale } = useAppTheme();

  const handleAdd = () => {
    overlay.showModal({ type: 'reminder_edit', props: {} });
  };

  const handleEdit = (id: string) => {
    overlay.showModal({ type: 'reminder_edit', props: { existingId: id } });
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('reminders.deleteConfirmTitle'), t('reminders.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('reminders.delete'), style: 'destructive', onPress: () => {
        remindersActions.deleteReminder(id);
        overlay.showToast(t('reminders.deleted'));
      }}
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { fontSize: scale(24), color: colors.text }]}>{t('reminders.title')}</Text>
      </View>

      <LegendList
        data={reminders}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { fontSize: scale(14), color: colors.textMuted }]}>{t('reminders.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.card, { borderBottomColor: colors.border }, pressed && { opacity: 0.7 }]} onPress={() => handleEdit(item.id)}>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { fontSize: scale(16), color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardDate, { fontSize: scale(14), color: colors.textMuted }]}>
                {item.date} ({item.calendarType === 'lunar' ? t('reminders.lunar') : t('reminders.solar')})
                {item.repeatYearly ? ` - ${t('reminders.yearly')}` : ''}
              </Text>
            </View>
            <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Text style={[styles.deleteText, { fontSize: scale(14), color: colors.danger }]}>{t('reminders.delete')}</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable style={({ pressed }) => [styles.fab, { bottom: insets.bottom + 20, backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]} onPress={handleAdd}>
        <Text style={[styles.fabText, { fontSize: scale(32) }]}>+</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {},
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    fontWeight: '500',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {},
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: '#fff',
    marginTop: -4,
  }
});
