import React from 'react';
import { View, TextStyle, StyleProp } from 'react-native';
import Octicons, { OcticonsIconName } from '@react-native-vector-icons/octicons';
import octiconsGlyphMap from '@react-native-vector-icons/octicons/glyphmaps/Octicons.json';

// Ground truth for "does this Octicon actually exist" — sourced from the
// installed package's own glyph map rather than guessed/hand-maintained, so a
// typo'd or renamed glyph can never silently render as a blank/wrong icon.
const VALID_OCTICON_NAMES = new Set(Object.keys(octiconsGlyphMap));

// Single icon family for the whole app: Octicons (react-native-vector-icons).
// Every screen/component renders icons through this one wrapper (never
// Octicons directly, never react-native-paper's built-in icon resolution) so
// there is exactly one icon system to keep consistent. `ICON_MAP` translates
// this app's existing semantic icon names (kept stable so call sites never
// had to change) to the closest real Octicons glyph name.
const ICON_MAP: Record<string, string> = {
  'arrow-left': 'arrow-left',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  menu: 'three-bars',
  'bell-outline': 'bell',
  star: 'star-fill',
  'star-outline': 'star',
  'star-circle-outline': 'star',
  sort: 'sort-asc',
  'filter-variant': 'filter',
  'dots-vertical': 'kebab-horizontal',
  pencil: 'pencil',
  delete: 'trash',
  'delete-outline': 'trash',
  close: 'x',
  'close-circle-outline': 'x-circle',
  'check-circle-outline': 'check-circle',
  'export-variant': 'share',
  plus: 'plus',
  download: 'download',
  restore: 'undo',
  'checkbox-multiple-marked-outline': 'tasklist',
  'file-delimited-outline': 'file',
  'file-excel-outline': 'file',
  'office-building': 'organization',
  'map-marker': 'location',
  'account-group': 'people',
  'code-tags': 'code',
  briefcase: 'briefcase',
  'clipboard-text-outline': 'checklist',
  'bullhorn-outline': 'megaphone',
  domain: 'organization',
  sitemap: 'organization',
  'badge-account': 'id-badge',
  'calendar-star': 'calendar',
  'lock-outline': 'lock',
  'timer-outline': 'clock',
  tune: 'sliders',
  magnify: 'search',
  'file-chart-outline': 'graph',
  'account-cog': 'people',
  'account-multiple-check': 'people',
};

export interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

// Resolves a semantic/legacy icon name (`ICON_MAP`) OR a direct Octicons glyph
// name (used by call sites added after the Octicons migration — Drawer menu,
// notification types, report types) to a verified-real Octicons glyph.
// Previously this only checked `ICON_MAP`, so any call site passing a real
// Octicon name directly (not a legacy key) always missed the map and fell
// through to the 'question' glyph — the reported "icons show as ?" bug.
const resolveIconName = (name: string): OcticonsIconName => {
  const mapped = ICON_MAP[name];
  if (mapped && VALID_OCTICON_NAMES.has(mapped)) return mapped as OcticonsIconName;
  if (VALID_OCTICON_NAMES.has(name)) return name as OcticonsIconName;
  return 'question';
};

// Drop-in replacement for react-native-paper's <Icon source={name} size={..} color={..} />.
// Keeps the fixed-size centered box every call site already lays out around
// (FAB/IconButton/neumorphic icon circles etc.), now rendering a real Octicons
// glyph instead of the previous emoji-glyph placeholder.
export const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, color, style, accessibilityLabel }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Octicons
      name={resolveIconName(name)}
      size={size}
      color={color}
      style={style}
      accessibilityLabel={accessibilityLabel || name}
    />
  </View>
);

// Factory for the function-form `icon`/`leadingIcon` prop accepted by Paper's
// IconButton, FAB, Chip, and Menu.Item — swaps Paper's own (unlinked) icon
// resolution for our Octicons glyph without changing the surrounding
// component, its layout, sizing, or ripple/touch behavior.
export const renderAppIcon = (name: string) => ({ size, color }: { size: number; color: string }) => (
  <AppIcon name={name} size={size} color={color} />
);
