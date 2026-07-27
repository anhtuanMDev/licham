import { LegendList } from '@legendapp/list/react-native';
import { observer } from '@legendapp/state/react';
import React from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions } from '../../state/reminders';

export const RemindersScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const reminders = reminders$.get();

  const handleAdd = () => {
    overlay.showModal({ type: 'reminder_edit', props: {} });
  };

  const handleEdit = (id: string) => {
    overlay.showModal({ type: 'reminder_edit', props: { existingId: id } });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xóa nhắc nhở', 'Bạn có chắc chắn muốn xóa nhắc nhở này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {
        remindersActions.deleteReminder(id);
        overlay.showToast('Đã xóa nhắc nhở');
      }}
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhắc Nhở</Text>
      </View>

      <LegendList
        data={reminders}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Chưa có nhắc nhở nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleEdit(item.id)}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>
                {item.date} ({item.calendarType === 'lunar' ? 'Âm lịch' : 'Dương lịch'})
                {item.repeatYearly ? ' - Hằng năm' : ''}
              </Text>
            </View>
            <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Xóa</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={handleAdd}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    color: 'red',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
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
    fontSize: 32,
    marginTop: -4,
  }
});
