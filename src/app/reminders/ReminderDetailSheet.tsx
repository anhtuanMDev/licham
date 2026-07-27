import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions } from '../../state/reminders';
import { notifications } from '../../scheduling/notifications';
import { format, parse } from 'date-fns';
import { solarToLunar } from '../../core/lunar/convert';
import { useAppTheme } from '../../core/theme';
import { observer } from '@legendapp/state/react';

type Props = {
  existingId?: string;
};

export const ReminderDetailSheet: React.FC<Props> = observer(({ existingId }) => {
  const existing = existingId ? reminders$.get().find(r => r.id === existingId) : null;
  const { colors, scale } = useAppTheme();
  
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: scale(22) }]}>
          {existingId ? 'Sửa Nhắc Nhở' : 'Thêm Nhắc Nhở'}
        </Text>
        <Pressable hitSlop={15} onPress={() => overlay.closeModal()}>
          <Text style={[styles.cancelText, { color: colors.textMuted, fontSize: scale(16) }]}>Hủy</Text>
        </Pressable>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textMuted, fontSize: scale(14) }]}>TIÊU ĐỀ</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text, fontSize: scale(17) }]}
            placeholder="VD: Sinh nhật mẹ, Giỗ nội"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>
      
      <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.inputLabel, { color: colors.textMuted, fontSize: scale(14) }]}>LOẠI LỊCH</Text>
        <View style={styles.toggleGroup}>
          <Pressable 
            style={[styles.toggleBtn, calendarType === 'lunar' && styles.toggleBtnActive]}
            onPress={() => setCalendarType('lunar')}
          >
            <Text style={[
              styles.toggleText, 
              { color: colors.textMuted, fontSize: scale(16) }, 
              calendarType === 'lunar' && { color: colors.primary, fontWeight: 'bold' }
            ]}>Âm Lịch</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, marginHorizontal: 8 }}>|</Text>
          <Pressable 
            style={[styles.toggleBtn, calendarType === 'solar' && styles.toggleBtnActive]}
            onPress={() => setCalendarType('solar')}
          >
            <Text style={[
              styles.toggleText, 
              { color: colors.textMuted, fontSize: scale(16) }, 
              calendarType === 'solar' && { color: colors.primary, fontWeight: 'bold' }
            ]}>Dương Lịch</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textMuted, fontSize: scale(14) }]}>NGÀY</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text, fontSize: scale(17) }]}
            placeholder={calendarType === 'solar' ? 'YYYY-MM-DD (VD: 2026-07-25)' : 'DD/MM/YYYY (VD: 12/06/2026)'}
            placeholderTextColor={colors.textMuted}
            value={dateStr}
            onChangeText={setDateStr}
          />
        </View>
      </View>

      {calendarType === 'solar' && (
        <View style={styles.conversionBox}>
          <Text style={[styles.conversionLabel, { color: colors.textMuted, fontSize: scale(14) }]}>Tự động quy đổi sang Âm lịch:</Text>
          <Text style={[styles.conversionValue, { color: colors.primary, fontSize: scale(16) }]}>
            {convertedLunarStr ? `${convertedLunarStr} (Âm lịch)` : 'Chưa đúng định dạng YYYY-MM-DD'}
          </Text>
        </View>
      )}
      
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.inputLabel, { color: colors.text, fontSize: scale(16), marginBottom: 0 }]}>Lặp lại hằng năm</Text>
        <Switch value={repeatYearly} onValueChange={setRepeatYearly} trackColor={{ true: colors.primary }} />
      </View>
      
      <Pressable 
        style={({ pressed }) => [
          styles.saveBtn, 
          { backgroundColor: colors.primary }, 
          pressed && { opacity: 0.8 }
        ]} 
        onPress={handleSave}
      >
        <Text style={[styles.saveBtnText, { fontSize: scale(17) }]}>
          {calendarType === 'solar' ? 'Xác nhận & Lưu' : 'Lưu Nhắc Nhở'}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontWeight: '700',
  },
  cancelText: {
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    paddingVertical: 4,
  },
  toggleBtnActive: {},
  toggleText: {
    fontWeight: '500',
  },
  conversionBox: {
    marginTop: -8,
    marginBottom: 24,
    paddingLeft: 16,
  },
  conversionLabel: {
    marginBottom: 4,
  },
  conversionValue: {
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  }
});
