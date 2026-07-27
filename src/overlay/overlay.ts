import { ui$, ModalPayload, Toast } from '../state/ui';

let idCounter = 0;
const generateId = () => `id_${Date.now()}_${++idCounter}`;

export const overlay = {
  showModal(payload: ModalPayload, priority: 'critical' | 'normal' = 'normal') {
    const newModal = { id: generateId(), priority, ...payload };
    const current = ui$.modal.get();
    
    if (!current) {
      ui$.modal.set(newModal);
    } else {
      const queue = ui$.modalQueue.get();
      if (priority === 'critical') {
        ui$.modalQueue.set([newModal, ...queue]);
      } else {
        ui$.modalQueue.push(newModal);
      }
    }
  },
  
  closeModal() {
    const queue = ui$.modalQueue.get();
    if (queue && queue.length > 0) {
      const next = queue[0];
      ui$.modalQueue.set(queue.slice(1));
      ui$.modal.set(next);
    } else {
      ui$.modal.set(null);
    }
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
