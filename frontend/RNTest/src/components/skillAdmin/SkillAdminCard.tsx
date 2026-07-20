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
      <View style={styles.header}>
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
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
