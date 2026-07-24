import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ui$, Toast } from '../state/ui';
import { overlay } from './overlay';

const ToastItem = ({ toast }: { toast: Toast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      overlay.dismissToast(toast.id);
    }, toast.duration);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <View style={styles.toast}>
      <Text style={styles.message}>{toast.message}</Text>
    </View>
  );
};

export const ToastHost = observer(() => {
  const queue = ui$.toastQueue.get();
  
  if (queue.length === 0) return null;
  
  // Render only the head of the queue to prevent toast stacking UI mess
  const activeToast = queue[0];
  
  return (
    <View style={styles.container} pointerEvents="none">
      <ToastItem toast={activeToast} key={activeToast.id} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
  }
});
