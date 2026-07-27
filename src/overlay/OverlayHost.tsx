import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ui$ } from '../state/ui';
import { overlay } from './overlay';
import { useAppTheme } from '../core/theme';

import { ReminderDetailSheet } from '../app/reminders/ReminderDetailSheet';
import { GoodDayFinderModal } from '../app/calendar/GoodDayFinderModal';
import { DayDetailSheet } from '../app/calendar/DayDetailSheet';
import { MonthYearPickerModal } from '../app/calendar/MonthYearPicker';

// No stub components currently needed

export const OverlayHost = observer(() => {
  const currentModal = ui$.modal.get();
  const { colors } = useAppTheme();

  if (!currentModal) return null;

  let content: React.ReactNode = null;

  switch (currentModal.type) {
    case 'day_detail':
      content = <DayDetailSheet {...currentModal.props} />;
      break;
    case 'reminder_edit':
      content = <ReminderDetailSheet {...currentModal.props} />;
      break;
    case 'good_day_finder':
      content = <GoodDayFinderModal />;
      break;
    case 'month_year_picker':
      content = <MonthYearPickerModal />;
      break;
    default:
      // Exhaustiveness check
      const _exhaustiveCheck: never = currentModal;
      return _exhaustiveCheck;
  }

  const isCentered = currentModal.type === 'month_year_picker';

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }, isCentered && styles.backdropCentered]}>
        <Pressable style={styles.backdropPressable} onPress={overlay.closeModal} />
        <View style={[styles.modalContent, { backgroundColor: colors.background }, isCentered && styles.modalContentCentered]}>
          {content}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end', // Assume most are bottom sheets
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: 200,
  },
  backdropCentered: {
    justifyContent: 'center',
    padding: 24,
  },
  modalContentCentered: {
    borderRadius: 16,
  },
  sheet: {
    padding: 16,
  }
});
