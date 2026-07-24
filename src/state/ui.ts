import { observable } from '@legendapp/state';

export type ModalType = 'reminder_edit' | 'date_search' | 'day_detail';
export type ApiStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';

export type Toast = {
  id: string;
  message: string;
  type?: 'info' | 'error' | 'success';
  duration?: number;
};

export const ui$ = observable({
  modal: null as { id: string; type: ModalType; props: any } | null,
  toastQueue: [] as Toast[],
  api: {} as Record<string, { status: ApiStatus; error?: string }>,
});
