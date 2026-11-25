import { Platform } from 'react-native';

// Цвета сняты с логотипа «Аш»: оранжевый #EA9520, чёрный контур, бежевый лаваш.
// На оранжевом текст тёмный — как контур в логотипе (белый на нём не читается).
export const Colors = {
  light: {
    text: '#1E1B18',
    background: '#FFFFFF',
    backgroundElement: '#F5F2EE',
    backgroundSelected: '#E9E4DD',
    textSecondary: '#6B645C',
    accent: '#EA9520',
    onAccent: '#1E1B18',
    tint: '#1E1B18', // активная вкладка: оранжевый на белом слишком бледный
  },
  dark: {
    text: '#FFFFFF',
    background: '#141210',
    backgroundElement: '#24211E',
    backgroundSelected: '#37332E',
    textSecondary: '#B3ABA1',
    accent: '#EA9520',
    onAccent: '#1E1B18',
    tint: '#EA9520',
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
} as const;

export const Radius = 16;

/** Высота нативного таб-бара: контент вкладок прокручивается под ним. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
