import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ui$ } from '../state/ui';
import { overlay } from './overlay';

import { ReminderDetailSheet } from '../app/reminders/ReminderDetailSheet';
import { GoodDayFinderModal } from '../app/calendar/GoodDayFinderModal';
import { DayDetailSheet } from '../app/calendar/DayDetailSheet';
import { MonthYearPickerModal } from '../app/calendar/MonthYearPickerModal';

// Stub components for the modals to be implemented later
const DateSearchModal = () => <View style={styles.sheet}><Text>Date Search Stub</Text></View>;

export const OverlayHost = observer(() => {
  const currentModal = ui$.modal.get();
  
  if (!currentModal) return null;
  
  let content: React.ReactNode = null;

  switch (currentModal.type) {
    case 'day_detail':
      content = <DayDetailSheet {...currentModal.props} />;
      break;
    case 'date_search':
      content = <DateSearchModal />;
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
      break;
  }
  
  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={overlay.closeModal} />
        <View style={styles.modalContent}>
          {content}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Assume most are bottom sheets
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: 200,
  },
  sheet: {
    padding: 16,
  }
});
