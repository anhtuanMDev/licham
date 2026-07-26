import { observable } from '@legendapp/state';
import { format } from 'date-fns';
import { LunarDate } from '../core/lunar/convert';

export const calendar$ = observable({
  visibleMonth: { 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 // 1-indexed
  },
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  // In-memory only cache — recomputed each session from @baostudio/viet-lunar
  lunarCache: {} as Record<string, LunarDate>,
});
