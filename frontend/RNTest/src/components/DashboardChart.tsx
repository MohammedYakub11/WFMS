import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line as SvgLine } from 'react-native-svg';
import { AppText } from './AppText';
import { Card } from './Cards';
import { lightTheme as theme } from '../theme/theme';

interface DashboardChartDatum {
  label: string;
  value: number;
}

interface DashboardChartProps {
  title: string;
  data: DashboardChartDatum[];
  emptyLabel?: string;
  // 'bar' (default) is the original horizontal-bar-list rendering used across
  // every existing dashboard widget. 'donut' and 'line' are additive variants
  // for the neumorphic dashboard redesign — same `data` shape, no new fetching.
  variant?: 'bar' | 'donut' | 'line';
  centerLabel?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  // Card surface style — defaults to 'flat' so every existing call site (e.g.
  // AdminOverviewScreen) renders exactly as before. Pass 'neu' to opt into the
  // softer raised-card look used by the redesigned Dashboard screen.
  cardVariant?: 'flat' | 'neu';
}

// Categorical palette for donut segments — this app has no existing multi-series
// color scale to reuse, so this is a small local constant rather than a new
// design-system token.
const DONUT_COLORS = [theme.colors.primary, '#6EE7B7', '#93C5FD', '#FBBF24', '#CBD5E1', '#F472B6'];

const Donut: React.FC<{ data: DashboardChartDatum[]; centerLabel?: string }> = ({ data, centerLabel }) => {
  const size = 160;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let cumulative = 0;

  return (
    <View style={styles.donutRow}>
      <View style={styles.donutSvgContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.border} strokeWidth={strokeWidth} fill="none" />
          {data.map((datum, index) => {
            const fraction = datum.value / total;
            const dashArray = `${circumference * fraction} ${circumference}`;
            const dashOffset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <Circle
                key={datum.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                fill="none"
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
              />
            );
          })}
        </Svg>
        <View style={styles.donutCenter} pointerEvents="none">
          <AppText variant="caption" color={theme.colors.textSecondary}>{centerLabel ?? 'Total'}</AppText>
          <AppText variant="h1">{total}</AppText>
        </View>
      </View>
      <View style={styles.donutLegend}>
        {data.map((datum, index) => {
          const pct = Math.round((datum.value / total) * 1000) / 10;
          return (
            <View key={datum.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }]} />
              <AppText style={styles.legendLabel} numberOfLines={1}>{datum.label}</AppText>
              <AppText style={styles.legendValue}>{datum.value}</AppText>
              <AppText variant="caption" color={theme.colors.textSecondary} style={styles.legendPct}>({pct}%)</AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const LineChart: React.FC<{ data: DashboardChartDatum[] }> = ({ data }) => {
  const width = 280;
  const height = 140;
  const paddingLeft = 32;
  const paddingBottom = 20;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const plotWidth = width - paddingLeft;
  const plotHeight = height - paddingBottom;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: paddingLeft + i * stepX,
    y: plotHeight - (d.value / maxValue) * plotHeight,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${plotHeight} L ${points[0].x} ${plotHeight} Z`
    : '';

  const peak = points.reduce((best, p, i) => (data[i].value > data[best].value ? i : best), 0);

  return (
    <View>
      <Svg width={width} height={height + 24}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <SvgLine
            key={f}
            x1={paddingLeft}
            x2={width}
            y1={plotHeight * (1 - f)}
            y2={plotHeight * (1 - f)}
            stroke={theme.colors.border}
            strokeWidth={1}
          />
        ))}
        {areaPath !== '' && <Path d={areaPath} fill={theme.colors.primary} fillOpacity={0.12} />}
        {linePath !== '' && <Path d={linePath} stroke={theme.colors.primary} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === peak ? 5 : 3} fill={theme.colors.surface} stroke={theme.colors.primary} strokeWidth={2} />
        ))}
      </Svg>
      <View style={styles.lineLabelsRow}>
        {data.map((d) => (
          <AppText key={d.label} variant="caption" color={theme.colors.textSecondary} style={styles.lineLabel}>
            {d.label}
          </AppText>
        ))}
      </View>
    </View>
  );
};

export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,
  emptyLabel = 'No data yet',
  variant = 'bar',
  centerLabel,
  actionLabel,
  onActionPress,
  cardVariant = 'flat',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card style={styles.card} variant={cardVariant}>
      <View style={styles.headerRow}>
        <AppText variant="h2" style={styles.title}>{title}</AppText>
        {actionLabel && (
          <AppText variant="caption" color={theme.colors.primary} onPress={onActionPress} style={styles.actionLabel}>
            {actionLabel} ›
          </AppText>
        )}
      </View>
      {data.length === 0 ? (
        <AppText style={styles.emptyText}>{emptyLabel}</AppText>
      ) : variant === 'donut' ? (
        <Donut data={data} centerLabel={centerLabel} />
      ) : variant === 'line' ? (
        <LineChart data={data} />
      ) : (
        data.map((datum, index) => (
          <View key={index} style={styles.row}>
            <AppText style={styles.label} numberOfLines={1}>{datum.label}</AppText>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.min(100, (datum.value / maxValue) * 100)}%` }]} />
            </View>
            <AppText style={styles.value}>{datum.value}</AppText>
          </View>
        ))
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 0,
  },
  actionLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 100,
    fontFamily: theme.typography.fontFamily.medium,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  value: {
    width: 30,
    textAlign: 'right',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  donutRow: {
    alignItems: 'center',
  },
  donutSvgContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutLegend: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
  },
  legendValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    marginLeft: 8,
  },
  legendPct: {
    width: 56,
    textAlign: 'right',
  },
  lineLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 32,
  },
  lineLabel: {
    flex: 1,
    textAlign: 'center',
  },
});
