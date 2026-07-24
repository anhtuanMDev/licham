import { observable } from '@legendapp/state';

export type ModalPayload = 
  | { type: 'reminder_edit'; props: { existingId?: string } }
  | { type: 'date_search'; props?: never }
  | { type: 'day_detail'; props: { dateIso: string } };
export type ApiStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';

export type Toast = {
  id: string;
  message: string;
  type?: 'info' | 'error' | 'success';
  duration?: number;
};

export const ui$ = observable({
  modal: null as (ModalPayload & { id: string }) | null,
  toastQueue: [] as Toast[],
  api: {} as Record<string, { status: ApiStatus; error?: string }>,
});
