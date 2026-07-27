import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ui$, Toast } from '../state/ui';
import { overlay } from './overlay';
import { useAppTheme } from '../core/theme';

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { colors, scale } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      overlay.dismissToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast]);

  const bgColor =
    toast.type === 'error'
      ? colors.danger
      : toast.type === 'success'
        ? '#2e7d32'
        : colors.surface;

  const textColor =
    toast.type === 'error' || toast.type === 'success'
      ? '#ffffff'
      : colors.text;

  return (
    <View style={[styles.toast, { backgroundColor: bgColor }]}>
      <Text style={[styles.message, { color: textColor, fontSize: scale(14) }]}>
        {toast.message}
      </Text>
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
    fontWeight: '500',
    textAlign: 'center',
  }
});
