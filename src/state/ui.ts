import { observable } from '@legendapp/state';

export type ModalPayload = 
  | { type: 'reminder_edit'; props: { existingId?: string } }
  | { type: 'day_detail'; props: { dateIso: string } }
  | { type: 'good_day_finder'; props?: never }
  | { type: 'month_year_picker'; props?: never };

export type Toast = {
  id: string;
  message: string;
  type?: 'info' | 'error' | 'success';
  duration?: number;
};

export const ui$ = observable({
  modal: null as (ModalPayload & { id: string; priority?: 'critical' | 'normal' }) | null,
  modalQueue: [] as (ModalPayload & { id: string; priority: 'critical' | 'normal' })[],
  toastQueue: [] as Toast[],
});
