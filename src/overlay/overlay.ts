import { ui$, ModalPayload, Toast } from '../state/ui';

let idCounter = 0;
const generateId = () => `id_${Date.now()}_${++idCounter}`;

export const overlay = {
  showModal(payload: ModalPayload, priority: 'critical' | 'normal' = 'normal') {
    // In a real app with queuing, we would push to an array.
    // For MVP, we just set the single active modal.
    ui$.modal.set({
      id: generateId(),
      ...payload
    });
  },
  
  closeModal() {
    ui$.modal.set(null);
  },

  showToast(message: string, opts?: { type?: 'info' | 'error' | 'success'; duration?: number }) {
    const id = generateId();
    const toast: Toast = { id, message, type: opts?.type || 'info', duration: opts?.duration || 3000 };
    
    // De-dupe if a toast with the exact same message is currently showing
    const currentQueue = ui$.toastQueue.get();
    if (currentQueue.some(t => t.message === message)) {
      return;
    }
    
    ui$.toastQueue.push(toast);
  },
  
  dismissToast(id: string) {
    ui$.toastQueue.set(current => current.filter(t => t.id !== id));
  }
};
