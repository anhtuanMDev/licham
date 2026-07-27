import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { syncWidgetData } from '../core/widgetSync';
import { calendar$ } from '../state/calendar';
import { format } from 'date-fns';

let timerId: ReturnType<typeof setTimeout> | null = null;
let appStateSubscription: NativeEventSubscription | null = null;

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function scheduleNextMidnight() {
  if (timerId) clearTimeout(timerId);
  
  const waitMs = msUntilMidnight();
  timerId = setTimeout(() => {
    // 1. Sync Widget
    syncWidgetData();
    // 2. Update calendar selected date to new today
    calendar$.selectedDate.set(format(new Date(), 'yyyy-MM-dd'));
    
    // Reschedule
    scheduleNextMidnight();
  }, waitMs);
}

export const midnightTicker = {
  start() {
    // Run immediately on start
    syncWidgetData();
    scheduleNextMidnight();
    
    // Listen for app state changes in case phone slept through midnight
    appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        syncWidgetData();
        // Only reset the selected date if it's stale (user backgrounded past midnight)
        const todayIso = format(new Date(), 'yyyy-MM-dd');
        if (calendar$.selectedDate.get() !== todayIso) {
          const stored = new Date(calendar$.selectedDate.get());
          const today = new Date();
          // Only auto-advance if the stored date is in the past (crossed midnight)
          if (stored < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            calendar$.selectedDate.set(todayIso);
          }
        }
        scheduleNextMidnight();
      } else {
        if (timerId) clearTimeout(timerId);
      }
    });
  },
  
  stop() {
    if (timerId) clearTimeout(timerId);
    if (appStateSubscription) appStateSubscription.remove();
  }
};
