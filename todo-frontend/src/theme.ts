// src/theme.ts
import { useColorScheme } from 'react-native';

const colors = {
  primary: '#FF453A', // デザイン案のボタンの色に合わせました
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8A8A8D',
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    border: '#C6C6C8',
    notification: colors.primary,
    surface: '#FFFFFF', // カードなどの表面色
    onSurface: '#000000', // 表面上のテキスト色
    onSurfaceVariant: '#8A8A8D', // 表面上の補助的なテキスト色
    onPrimary: '#FFFFFF', // プライマリーカラー上のテキスト色
  }
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: colors.primary,
    surface: '#1C1C1E',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#8A8A8D',
    onPrimary: '#FFFFFF',
  }
};

// デバイスのテーマ設定に応じて適切なテーマを返すカスタムフック
export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  return lightTheme;
};