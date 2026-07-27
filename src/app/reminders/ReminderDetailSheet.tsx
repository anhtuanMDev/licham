import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch } from 'react-native';
import { overlay } from '../../overlay/overlay';
import { reminders$, remindersActions } from '../../state/reminders';
import { notifications } from '../../scheduling/notifications';
import { format, parse } from 'date-fns';
import { solarToLunar } from '../../core/lunar/convert';
import { useAppTheme } from '../../core/theme';
import { observer } from '@legendapp/state/react';
import { useMemo } from 'react';

type Props = {
  existingId?: string;
};

export const ReminderDetailSheet: React.FC<Props> = observer(({ existingId }) => {
  const existing = existingId ? reminders$.get().find(r => r.id === existingId) : null;
  const { colors, scale } = useAppTheme();

  const [title, setTitle] = useState(existing?.title || '');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(existing?.calendarType || 'lunar');
  const styles = useMemo(() => createStyles(colors, scale, calendarType), [colors, scale, calendarType]);
  const getInitialDateStr = () => {
    if (existing) {
      if (existing.calendarType === 'solar') {
        const p = parse(existing.date, 'yyyy-MM-dd', new Date());
        if (!isNaN(p.getTime())) return format(p, 'dd/MM/yyyy');
      }
      return existing.date;
    }
    return format(new Date(), 'dd/MM/yyyy');
  };

  const [dateStr, setDateStr] = useState(getInitialDateStr());
  const [repeatYearly, setRepeatYearly] = useState(existing?.repeatYearly ?? true);

  // Compute converted lunar date preview when calendarType === 'solar'
  let convertedLunarStr: string | null = null;
  let finalSolarDbStr: string | null = null;

  if (calendarType === 'solar' && dateStr.trim()) {
    try {
      const parsedDate = parse(dateStr.trim(), 'dd/MM/yyyy', new Date());
      if (!isNaN(parsedDate.getTime())) {
        const lunar = solarToLunar(parsedDate.getDate(), parsedDate.getMonth() + 1, parsedDate.getFullYear());
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        convertedLunarStr = `${pad(lunar.day)}/${pad(lunar.month)}/${lunar.year}`;
        finalSolarDbStr = format(parsedDate, 'yyyy-MM-dd');
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

    if (calendarType === 'solar' && !finalSolarDbStr) {
      overlay.showToast('Ngày Dương lịch không hợp lệ (Định dạng: DD/MM/YYYY)', { type: 'error' });
      return;
    }

    // For lunar, we could add basic validation but trusting DD/MM/YYYY format for now
    if (calendarType === 'lunar' && dateStr.trim().split('/').length !== 3) {
      overlay.showToast('Ngày Âm lịch không hợp lệ (Định dạng: DD/MM/YYYY)', { type: 'error' });
      return;
    }

    await notifications.requestPermission();

    const finalDate = calendarType === 'solar' ? finalSolarDbStr! : dateStr.trim();

    if (existingId) {
      await remindersActions.updateReminder(existingId, {
        title,
        calendarType,
        date: finalDate,
        repeatYearly
      });
      overlay.showToast('Đã lưu nhắc nhở');
    } else {
      await remindersActions.addReminder({
        title,
        calendarType,
        date: finalDate,
        repeatYearly
      });
      overlay.showToast('Đã thêm nhắc nhở');
    }

    overlay.closeModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          {existingId ? 'Sửa Nhắc Nhở' : 'Thêm Nhắc Nhở'}
        </Text>
        <Pressable hitSlop={15} onPress={() => overlay.closeModal()}>
          <Text style={styles.cancelText}>Hủy</Text>
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabelBase}>TIÊU ĐỀ</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="VD: Sinh nhật mẹ, Giỗ nội"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.inputLabelBase}>LOẠI LỊCH</Text>
        <View style={styles.toggleGroup}>
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setCalendarType('lunar')}
          >
            <Text style={calendarType === 'lunar' ? styles.toggleTextActive : styles.toggleText}>
              Âm Lịch
            </Text>
          </Pressable>
          <Text style={styles.toggleDivider}>|</Text>
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setCalendarType('solar')}
          >
            <Text style={calendarType === 'solar' ? styles.toggleTextActive : styles.toggleText}>
              Dương Lịch
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabelBase}>NGÀY</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY (VD: 25/07/2026)"
            placeholderTextColor={colors.textMuted}
            value={dateStr}
            onChangeText={setDateStr}
          />
        </View>
      </View>

      {calendarType === 'solar' && (
        <View style={styles.conversionBox}>
          <Text style={styles.conversionLabel}>Tự động quy đổi sang Âm lịch:</Text>
          <Text style={styles.conversionValue}>
            {convertedLunarStr ? `${convertedLunarStr} (Âm lịch)` : 'Chưa đúng định dạng DD/MM/YYYY'}
          </Text>
        </View>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Lặp lại hằng năm</Text>
        <Switch value={repeatYearly} onValueChange={setRepeatYearly} trackColor={{ true: colors.primary }} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveBtn,
          pressed && { opacity: 0.8 }
        ]}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>
          {calendarType === 'solar' ? 'Xác nhận & Lưu' : 'Lưu Nhắc Nhở'}
        </Text>
      </Pressable>
    </View>
  );
});

const createStyles = (colors: any, scale: (size: number) => number, calendarType: string) => StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontWeight: '700',
    color: colors.text,
    fontSize: scale(22),
  },
  cancelText: {
    fontWeight: '500',
    color: colors.textMuted,
    fontSize: scale(16),
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabelBase: {
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    color: colors.textMuted,
    fontSize: scale(14),
  },
  inputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: scale(17),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    paddingVertical: 4,
  },
  toggleText: {
    fontWeight: '500',
    color: colors.textMuted,
    fontSize: scale(16),
  },
  toggleTextActive: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: scale(16),
  },
  toggleDivider: {
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  conversionBox: {
    marginTop: -8,
    marginBottom: 24,
    paddingLeft: 16,
  },
  conversionLabel: {
    marginBottom: 4,
    color: colors.textMuted,
    fontSize: scale(14),
  },
  conversionValue: {
    fontWeight: '600',
    color: colors.primary,
    fontSize: scale(16),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    fontWeight: '600',
    color: colors.text,
    fontSize: scale(16),
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: scale(17),
  }
});
