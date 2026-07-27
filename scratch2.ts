import { calendar$ } from './src/state/calendar';
import { reminders$ } from './src/state/reminders';

// simulate adding an event for Oct 20th
reminders$.set([{
  id: 'test',
  title: 'Test Custom Event',
  calendarType: 'solar',
  date: '2026-10-20',
  repeatYearly: true
}]);

console.log("Reminders in state:", reminders$.get());

