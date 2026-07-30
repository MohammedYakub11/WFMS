import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Checkbox } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Skill } from '../../types/skills';

interface SkillAdminCardProps {
  skill: Skill;
  onPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const getStatusColor = (isActive: boolean, theme: typeof lightTheme) =>
  isActive ? theme.colors.statusActive : theme.colors.statusDisabled;

const SkillAdminCardComponent: React.FC<SkillAdminCardProps> = ({
  skill,
  onPress,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const statusColor = getStatusColor(skill.isActive, theme);

  return (
    <Card style={styles.card} onPress={onPress}>
      {/* Name, category chip, and status badge share one row — wrapping only
          if the screen is too narrow to fit all three — instead of stacking
          the chip/badge on their own row underneath, which wasted vertical
          space on every card in what can be a long list. */}
      <View style={styles.headerRow}>
        {selectionMode && (
          <Checkbox
            status={selected ? 'checked' : 'unchecked'}
            onPress={onToggleSelect}
          />
        )}
        <View style={styles.titleContainer}>
          <AppText variant="h2" numberOfLines={1}>{skill.skillName}</AppText>
          {!!skill.skillCode && (
            <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
              {skill.skillCode}
            </AppText>
          )}
        </View>

        <View style={styles.metaRow}>
          {skill.category?.categoryName && (
            <Chip
              style={[styles.chip, { backgroundColor: theme.colors.border }]}
              textStyle={[styles.chipText, { color: theme.colors.textSecondary }]}
              compact
            >
              {skill.category.categoryName}
            </Chip>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <AppText variant="caption" style={styles.statusText}>
              {skill.isActive ? 'Active' : 'Inactive'}
            </AppText>
          </View>
        </View>
      </View>

      {!!skill.requiredCertification && (
        <View style={[styles.footer, { borderTopColor: theme.colors.divider }]}>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Requires: {skill.requiredCertification}
          </AppText>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  // Matches the SkillCard/My Skills spacing convention: 8dp on each card
  // yields a 16dp gap between consecutive cards, so each neumorphic surface
  // has room for its shadow instead of blending into its neighbor.
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  titleContainer: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: '45%',
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
    marginLeft: 'auto',
  },
  chip: {},
  chipText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 12,
  },
});

export const SkillAdminCard = memo(SkillAdminCardComponent);
