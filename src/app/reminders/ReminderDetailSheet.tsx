import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions } from '../../state/reminders';
import { notifications } from '../../scheduling/notifications';
import { format } from 'date-fns';

type Props = {
  existingId?: string;
};

export const ReminderDetailSheet: React.FC<Props> = ({ existingId }) => {
  const existing = existingId ? reminders$.get().find(r => r.id === existingId) : null;
  
  const [title, setTitle] = useState(existing?.title || '');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(existing?.calendarType || 'lunar');
  // Simple fallback date string for MVP
  const [dateStr, setDateStr] = useState(existing?.date || format(new Date(), 'yyyy-MM-dd'));
  const [repeatYearly, setRepeatYearly] = useState(existing?.repeatYearly ?? true);

  const handleSave = async () => {
    if (!title.trim()) {
      overlay.showToast('Vui lòng nhập tiêu đề', { type: 'error' });
      return;
    }
    
    // Request permissions before saving if we're doing notifications
    await notifications.requestPermission();

    if (existingId) {
      await remindersActions.updateReminder(existingId, {
        title,
        calendarType,
        date: dateStr,
        repeatYearly
      });
      overlay.showToast('Đã cập nhật');
    } else {
      await remindersActions.addReminder({
        title,
        calendarType,
        date: dateStr,
        repeatYearly
      });
      overlay.showToast('Đã thêm nhắc nhở');
    }
    
    overlay.closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{existingId ? 'Sửa Nhắc Nhở' : 'Thêm Nhắc Nhở'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tiêu đề (VD: Sinh nhật mẹ, Giỗ nội)"
        value={title}
        onChangeText={setTitle}
      />
      
      <View style={styles.row}>
        <Text style={styles.label}>Loại lịch:</Text>
        <Pressable 
          style={[styles.chip, calendarType === 'lunar' && styles.chipActive]}
          onPress={() => setCalendarType('lunar')}>
          <Text style={[styles.chipText, calendarType === 'lunar' && styles.chipTextActive]}>Âm Lịch</Text>
        </Pressable>
        <Pressable 
          style={[styles.chip, calendarType === 'solar' && styles.chipActive]}
          onPress={() => setCalendarType('solar')}>
          <Text style={[styles.chipText, calendarType === 'solar' && styles.chipTextActive]}>Dương Lịch</Text>
        </Pressable>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder={calendarType === 'solar' ? 'YYYY-MM-DD' : 'DD/MM/YYYY'}
        value={dateStr}
        onChangeText={setDateStr}
      />
      
      <View style={styles.row}>
        <Text style={styles.label}>Lặp lại hằng năm</Text>
        <Switch value={repeatYearly} onValueChange={setRepeatYearly} />
      </View>
      
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => overlay.closeModal()}>
          <Text style={styles.btnTextCancel}>Hủy</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave}>
          <Text style={styles.btnTextSave}>Lưu</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 8,
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#f5f5f5',
  },
  btnSave: {
    backgroundColor: '#007AFF',
  },
  btnTextCancel: {
    fontSize: 16,
    color: '#666',
  },
  btnTextSave: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  }
});
