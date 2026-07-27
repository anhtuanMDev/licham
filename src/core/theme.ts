import { useMemo } from 'react';
import { settings$ } from '../state/settings';

export type AppColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  danger: string;
  dangerSurface: string;
  dangerBorder: string;
};

export const lightColors: AppColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#333333',
  textMuted: '#666666',
  border: '#eeeeee',
  primary: '#007AFF',
  danger: '#d32f2f',
  dangerSurface: '#fff0f0',
  dangerBorder: '#ffcdd2',
};

export const darkColors: AppColors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textMuted: '#aaaaaa',
  border: '#333333',
  primary: '#0A84FF',
  danger: '#ff6b6b',
  dangerSurface: '#3a1c1c',
  dangerBorder: '#5a2a2a',
};

export const highContrastColors: AppColors = {
  background: '#000000',
  surface: '#000000',
  text: '#ffffff',
  textMuted: '#ffffff',
  border: '#ffffff',
  primary: '#ffff00',
  danger: '#ff0000',
  dangerSurface: '#000000',
  dangerBorder: '#ff0000',
};

export function useAppTheme() {
  const theme = settings$.theme.get();
  const fontScale = settings$.fontScale.get() || 1;

  const colors = useMemo(() => {
    switch (theme) {
      case 'dark':
        return darkColors;
      case 'high-contrast':
        return highContrastColors;
      case 'light':
      default:
        return lightColors;
    }
  }, [theme]);

  const scale = (size: number) => size * fontScale;

  return { colors, scale, isDark: theme !== 'light' };
}
