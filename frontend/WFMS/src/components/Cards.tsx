import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { lightTheme as theme } from '../theme/theme';

// Neumorphic (Soft UI) page/surface color — the dashboard redesign's cards are
// meant to be the *same* color as the page background (only the shadow reads
// as a card), per the design spec. Kept as a local constant rather than
// changed on `theme.colors.surface`/`background`, since those are used for
// plain white/contrasting surfaces across every other screen in the app —
// repointing them here would visually regress screens outside this redesign.
export const NEU_BACKGROUND = '#F5F7FA';

interface NeuSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none' | 'link' | 'summary';
  accessibilityState?: { disabled?: boolean; selected?: boolean };
}

// True dual-shadow Soft UI / neumorphism primitive: a light highlight shadow
// (top-left) and a dark shadow (bottom-right) sit as two transparent-content,
// absolutely-positioned layers behind the visible surface, so the surface
// reads as *raised off the page* rather than a bordered/elevated Material
// card. React Native only renders directional shadowColor/shadowOffset/
// shadowRadius on iOS — Android's `elevation` draws a single flat dark
// shadow with no highlight — so on Android this degrades gracefully to the
// dark layer's elevation alone (documented platform limitation, not a bug).
export const NeuSurface: React.FC<NeuSurfaceProps> = ({
  children,
  style,
  contentStyle,
  radius = theme.radius.xxl,
  onPress,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
}) => {
  const ContentContainer = onPress ? TouchableOpacity : View;
  return (
    <View style={style}>
      <View style={[StyleSheet.absoluteFill, styles.neuLight, { borderRadius: radius }]} />
      <View style={[StyleSheet.absoluteFill, styles.neuDark, { borderRadius: radius }]} />
      <ContentContainer
        style={[styles.neuContent, { borderRadius: radius }, contentStyle]}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
      >
        {children}
      </ContentContainer>
    </View>
  );
};

interface NeuIconCircleProps {
  children: React.ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
  // Overrides the visible circle surface itself (e.g. a selected/active fill
  // color) — `style` alone only sizes/positions the outer wrapper and never
  // reaches the actual rendered surface, so a caller passing a backgroundColor
  // via `style` was previously a silent no-op.
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

// Raised circular Soft UI icon container — reused everywhere the neumorphic
// redesign needs an icon "sitting" on the page (stat cards, quick actions,
// header actions, list-row icons) instead of the old flat tinted-square look.
export const NeuIconCircle: React.FC<NeuIconCircleProps> = ({ children, size = 48, style, contentStyle, onPress }) => (
  <NeuSurface
    radius={size / 2}
    style={[{ width: size, height: size }, style]}
    contentStyle={[styles.neuIconContent, { width: size, height: size, borderRadius: size / 2 }, contentStyle]}
    onPress={onPress}
  >
    {children}
  </NeuSurface>
);

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  // 'flat' (default) is the original card style used everywhere today.
  // 'neu' is the true Soft UI dual-shadow raised surface used by the
  // neumorphic dashboard redesign — opt-in only, so every existing screen
  // (which passes no `variant`) renders exactly as before.
  variant?: 'flat' | 'neu';
  // Overrides the default 20px content padding (e.g. StatCard's tighter
  // 3-per-row layout needs less padding to leave room for its label) — `style`
  // alone only sizes/positions the outer wrapper, same as NeuSurface/
  // NeuIconCircle above.
  contentStyle?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, variant = 'neu', contentStyle }) => {
  if (variant === 'neu') {
    return (
      <NeuSurface style={style} contentStyle={[styles.neuCardPadding, contentStyle]} onPress={onPress}>
        {children}
      </NeuSurface>
    );
  }

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </Container>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  footerAction?: React.ReactNode;
  onPress?: () => void;
  variant?: 'flat' | 'neu';
  // 'centered' stacks a large circular icon above the title/value — used by the
  // neumorphic dashboard's 2-column stat grid. Default 'header' keeps the
  // original icon-left/value-right layout every existing screen already uses.
  layout?: 'header' | 'centered';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendPositive,
  icon,
  footerAction,
  onPress,
  variant = 'neu',
  layout = 'header',
}) => {
  if (layout === 'centered') {
    return (
      <Card
        onPress={onPress}
        style={[styles.statCard, variant === 'neu' && styles.statCardNeu]}
        contentStyle={variant === 'neu' ? styles.statCardContentNeu : undefined}
        variant={variant}
      >
        <View style={styles.centeredContent}>
          {icon && (
            variant === 'neu' ? (
              <NeuIconCircle size={44} style={styles.iconContainerCentered}>{icon}</NeuIconCircle>
            ) : (
              <View style={[styles.iconContainer, styles.iconContainerCentered]}>{icon}</View>
            )
          )}
          <AppText variant="h2" style={styles.statValueCentered}>{value}</AppText>
          <AppText variant="caption" style={styles.statTitleCentered} numberOfLines={2}>{title}</AppText>
          {trend && (
            <AppText style={[styles.trendTextCentered, { color: trendPositive ? theme.colors.success : theme.colors.error }]}>
              {trendPositive ? '↑' : '↓'} {trend}
            </AppText>
          )}
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={[styles.statCard, variant === 'neu' && styles.statCardNeu]} variant={variant}>
      <View style={styles.statHeader}>
        {icon && (
          variant === 'neu' ? <NeuIconCircle style={styles.iconContainerMargin}>{icon}</NeuIconCircle> : <View style={styles.iconContainer}>{icon}</View>
        )}
        <View style={styles.statInfo}>
          {/* A fixed style + numberOfLines (no per-instance adjustsFontSizeToFit)
              is what actually guarantees every stat title renders with
              identical font size/weight/line height — auto-shrink-to-fit
              scales *independently* per card based on that card's own text
              length, so a short title ("Roles") stayed full-size while a
              longer one in the same row ("Pending Approvals") visibly
              shrank — which was the reported inconsistency. */}
          <AppText variant="caption" style={styles.statTitle} numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="h2" style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {value}
          </AppText>
        </View>
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <AppText style={[styles.trendText, { color: trendPositive ? theme.colors.success : theme.colors.error }]}>
            {trendPositive ? '↑' : '↓'} {trend}
          </AppText>
          <AppText variant="caption" style={styles.trendSubtitle}>from last month</AppText>
        </View>
      )}
      {footerAction && (
        <View style={styles.footerActionContainer}>
          {footerAction}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2, // Android shadow
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginVertical: 8,
  },
  // Both shadow-only layers and the content layer share the same flat page
  // color — the color never contrasts against the page, only the shadow does.
  neuLight: {
    backgroundColor: NEU_BACKGROUND,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.95,
    shadowRadius: 12,
  },
  neuDark: {
    backgroundColor: NEU_BACKGROUND,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  neuContent: {
    backgroundColor: NEU_BACKGROUND,
  },
  neuCardPadding: {
    padding: 20,
  },
  neuIconContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardNeu: {
    margin: 4,
  },
  // Tighter than the default 20px card padding — frees width for the label
  // in a 3-per-row layout (the default padding alone left barely enough room
  // for the icon circle, let alone "Total Skills"/"Approved"/"Pending").
  statCardContentNeu: {
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  centeredContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainerCentered: {
    marginBottom: 8,
  },
  iconContainerMargin: {
    marginRight: 16,
  },
  statValueCentered: {
    color: '#111827',
  },
  statTitleCentered: {
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
    // Reserves 2 lines' worth of height so all cards in a row stay the same
    // height whether their label wraps to one line or two — never clipped,
    // never truncated with an ellipsis.
    minHeight: 32,
  },
  trendTextCentered: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    margin: 4,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DCFCE7', // Soft green background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  // One fixed, explicit typography style for every stat title, regardless of
  // text length — font size/weight/line height/letter spacing/alignment must
  // be identical across sibling cards (see the comment at the JSX above).
  statTitle: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    textAlign: 'left',
    fontFamily: theme.typography.fontFamily.medium,
    minHeight: 32,
  },
  statValue: {
    color: '#111827',
    fontSize: 28,
    lineHeight: 32,
  },
  trendContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  trendText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  trendSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  footerActionContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
});
