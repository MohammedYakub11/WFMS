import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';

export interface AppTextProps extends TextProps {
  variant?: 'caption' | 'tableText' | 'inputLabel' | 'bodyText' | 'buttonText' | 'cardTitle' | 'sectionHeading' | 'screenTitle' | 'splashTitle' | 'h1' | 'h2' | 'h3' | 'body';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  // Shrinks the font to fit instead of truncating with an ellipsis — for text
  // that must never be cut off (e.g. an employee name in a profile header).
  // Wraps onto a 2nd line (default `numberOfLines`, overridable via the
  // standard prop) only once shrinking to `minFontScale` still isn't enough.
  autoSize?: boolean;
  minFontScale?: number;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyText',
  weight = 'regular',
  color,
  align = 'left',
  style,
  children,
  autoSize = false,
  minFontScale = 0.6,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale,
  ...rest
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const getFontSize = () => theme.typography.fontSize[variant];
  const getFontFamily = () => theme.typography.fontFamily[weight];
  const getTextColor = () => color || theme.colors.textPrimary;

  const textStyles = StyleSheet.flatten([
    {
      fontSize: getFontSize(),
      fontFamily: getFontFamily(),
      color: getTextColor(),
      textAlign: align,
    },
    style,
  ]);

  return (
    <Text
      style={textStyles}
      numberOfLines={numberOfLines ?? (autoSize ? 2 : undefined)}
      adjustsFontSizeToFit={autoSize || adjustsFontSizeToFit}
      minimumFontScale={autoSize ? minFontScale : minimumFontScale}
      {...rest}
    >
      {children}
    </Text>
  );
};
