import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ui$ } from '../state/ui';
import { overlay } from './overlay';

// Stub components for the modals to be implemented later
const DayDetailSheet = (props: any) => <View style={styles.sheet}><Text>Day Detail Sheet Stub</Text></View>;
const DateSearchModal = (props: any) => <View style={styles.sheet}><Text>Date Search Stub</Text></View>;
const ReminderEditModal = (props: any) => <View style={styles.sheet}><Text>Reminder Edit Stub</Text></View>;

const modalMap = {
  day_detail: DayDetailSheet,
  date_search: DateSearchModal,
  reminder_edit: ReminderEditModal,
};

export const OverlayHost = observer(() => {
  const currentModal = ui$.modal.get();
  
  if (!currentModal) return null;
  
  const Component = modalMap[currentModal.type];
  
  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={overlay.closeModal} />
        <View style={styles.modalContent}>
          {Component && <Component {...currentModal.props} />}
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
