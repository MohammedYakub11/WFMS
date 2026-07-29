import React from 'react';
import { View, Text, TextStyle, StyleProp } from 'react-native';

// react-native-vector-icons / MaterialCommunityIcons is not installed or linked
// in this project, so react-native-paper's string icon names (Icon/IconButton/FAB/
// Chip/Menu.Item) render as empty squares. These are plain Unicode/emoji glyphs,
// rendered by the OS system font, so no icon font linking is required.
const ICON_MAP: Record<string, string> = {
  'arrow-left': '⬅️',
  'chevron-left': '‹',
  'chevron-right': '›',
  menu: '☰',
  'bell-outline': '🔔',
  star: '⭐',
  'star-outline': '☆',
  'star-circle-outline': '⭐',
  sort: '↕️',
  'filter-variant': '🔽',
  'dots-vertical': '⋮',
  pencil: '✏️',
  delete: '🗑️',
  'delete-outline': '🗑️',
  close: '✕',
  'close-circle-outline': '❌',
  'check-circle-outline': '✅',
  'export-variant': '📤',
  plus: '➕',
  download: '⬇️',
  restore: '♻️',
  'checkbox-multiple-marked-outline': '☑️',
  'file-delimited-outline': '📄',
  'file-excel-outline': '📊',
  'office-building': '🏢',
  'map-marker': '📍',
  'account-group': '👥',
  'code-tags': '💻',
  briefcase: '💼',
  'clipboard-text-outline': '📋',
  'bullhorn-outline': '📣',
  domain: '🏢',
  sitemap: '🗺️',
  'badge-account': '🪪',
  'calendar-star': '📅',
  'lock-outline': '🔒',
  'timer-outline': '⏱️',
  tune: '🎛️',
  magnify: '🔍',
  'file-chart-outline': '📈',
  'account-cog': '⚙️',
  'account-multiple-check': '👥',
};

export interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// Drop-in replacement for react-native-paper's <Icon source={name} size={..} color={..} />.
// Emoji glyph metrics (ascent/descent) aren't centered the way icon-font glyphs are, so
// centering is done via a fixed-size flex box rather than relying on lineHeight/textAlign —
// this is what keeps the glyph centered inside FAB/IconButton regardless of screen or glyph.
export const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, color, style }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text
      style={[{ fontSize: size * 0.85, color, textAlign: 'center' }, style]}
      accessibilityElementsHidden
    >
      {ICON_MAP[name] || '▢'}
    </Text>
  </View>
);

// Factory for the function-form `icon`/`leadingIcon` prop accepted by Paper's
// IconButton, FAB, Chip, and Menu.Item — swaps the broken string-name icon
// resolution for our emoji glyph without changing the surrounding component,
// its layout, sizing, or ripple/touch behavior.
export const renderAppIcon = (name: string) => ({ size, color }: { size: number; color: string }) => (
  <AppIcon name={name} size={size} color={color} />
);
