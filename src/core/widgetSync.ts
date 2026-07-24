import { NativeModules, Platform } from 'react-native';
import { format } from 'date-fns';
import { solarToLunar } from './lunar/convert';
import { getDayCanChi } from './lunar/canChi';

const { WidgetDataModule } = NativeModules;

export function syncWidgetData() {
  if (Platform.OS !== 'android') {
    return; // iOS widget sync would go here later
  }

  if (!WidgetDataModule) {
    console.warn('WidgetDataModule is not linked properly.');
    return;
  }

  const today = new Date();
  
  // Format Solar
  const solarText = format(today, 'dd/MM/yyyy');
  
  // Format Lunar
  const lunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
  const lunarText = `Âm lịch: ${lunar.day}/${lunar.month}`;
  
  // Format Can Chi
  const canChiInfo = getDayCanChi(today);
  const canChiText = `Ngày ${canChiInfo.canChi}`;

  // Send to Native Android Module
  WidgetDataModule.setWidgetData(solarText, lunarText, canChiText);
}
