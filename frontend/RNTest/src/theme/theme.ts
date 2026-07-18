import { LightColors, DarkColors, ThemeColors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';
import { Radius } from './radius';
import { Shadows } from './shadows';

export interface AppTheme {
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radius: typeof Radius;
  shadows: typeof Shadows.light;
  isDark: boolean;
}

export const lightTheme: AppTheme = {
  colors: LightColors,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows.light,
  isDark: false,
};

export const darkTheme: AppTheme = {
  colors: DarkColors,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows.dark,
  isDark: true,
};
