import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions } from '../../state/reminders';
import { notifications } from '../../scheduling/notifications';
import { format, parse } from 'date-fns';
import { solarToLunar } from '../../core/lunar/convert';

type Props = {
  existingId?: string;
};

export const ReminderDetailSheet: React.FC<Props> = ({ existingId }) => {
  const existing = existingId ? reminders$.get().find(r => r.id === existingId) : null;
  
  const [title, setTitle] = useState(existing?.title || '');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(existing?.calendarType || 'lunar');
  const [dateStr, setDateStr] = useState(existing?.date || (calendarType === 'solar' ? format(new Date(), 'yyyy-MM-dd') : format(new Date(), 'dd/MM/yyyy')));
  const [repeatYearly, setRepeatYearly] = useState(existing?.repeatYearly ?? true);

  // Compute converted lunar date when calendarType === 'solar'
  let convertedLunarStr: string | null = null;
  if (calendarType === 'solar' && dateStr.trim()) {
    try {
      const parsedDate = parse(dateStr.trim(), 'yyyy-MM-dd', new Date());
      if (!isNaN(parsedDate.getTime())) {
        const lunar = solarToLunar(parsedDate.getDate(), parsedDate.getMonth() + 1, parsedDate.getFullYear());
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        convertedLunarStr = `${pad(lunar.day)}/${pad(lunar.month)}/${lunar.year}`;
      }
    } catch (e) {
      convertedLunarStr = null;
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      overlay.showToast('Vui lòng nhập tiêu đề', { type: 'error' });
      return;
    }

    if (calendarType === 'solar' && !convertedLunarStr) {
      overlay.showToast('Ngày Dương lịch không hợp lệ (Định dạng: YYYY-MM-DD)', { type: 'error' });
      return;
    }

    await notifications.requestPermission();

    // 1. If input is Lunar: store Lunar date directly
    // 2. If input is Solar: save converted Lunar date as a Lunar reminder
    const finalCalendarType = 'lunar';
    const finalDate = calendarType === 'solar' ? convertedLunarStr! : dateStr.trim();

    if (existingId) {
      await remindersActions.updateReminder(existingId, {
        title,
        calendarType: finalCalendarType,
        date: finalDate,
        repeatYearly
      });
      overlay.showToast(`Đã lưu lịch Âm: ${finalDate}`);
    } else {
      await remindersActions.addReminder({
        title,
        calendarType: finalCalendarType,
        date: finalDate,
        repeatYearly
      });
      overlay.showToast(`Đã thêm lịch Âm: ${finalDate}`);
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
        <Text style={styles.label}>Nhập theo lịch:</Text>
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
        placeholder={calendarType === 'solar' ? 'YYYY-MM-DD (VD: 2026-07-25)' : 'DD/MM/YYYY (VD: 12/06/2026)'}
        value={dateStr}
        onChangeText={setDateStr}
      />

      {calendarType === 'solar' && (
        <View style={styles.conversionBox}>
          <Text style={styles.conversionLabel}>Tự động quy đổi sang Âm lịch:</Text>
          <Text style={styles.conversionValue}>
            {convertedLunarStr ? `${convertedLunarStr} (Âm lịch)` : 'Chưa đúng định dạng YYYY-MM-DD'}
          </Text>
        </View>
      )}
      
      <View style={styles.row}>
        <Text style={styles.label}>Lặp lại hằng năm</Text>
        <Switch value={repeatYearly} onValueChange={setRepeatYearly} />
      </View>
      
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => overlay.closeModal()}>
          <Text style={styles.btnTextCancel}>Hủy</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave}>
          <Text style={styles.btnTextSave}>
            {calendarType === 'solar' ? 'Xác nhận & Lưu Âm Lịch' : 'Lưu'}
          </Text>
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
  conversionBox: {
    backgroundColor: '#e8f0fe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  conversionLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  conversionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
