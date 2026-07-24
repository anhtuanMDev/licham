import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { format } from 'date-fns';
import { LunarDate } from '../core/lunar/convert';
import './init'; // Ensure MMKV is configured

export const calendar$ = observable({
  visibleMonth: { 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 // 1-indexed
  },
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  lunarCache: {} as Record<string, LunarDate>,
});

// We only want to persist the lunarCache, not the visible month or selected date.
// Legend-state allows syncing specific nodes of an observable.
persistObservable(calendar$.lunarCache, {
  local: 'app_lunarCache',
});
