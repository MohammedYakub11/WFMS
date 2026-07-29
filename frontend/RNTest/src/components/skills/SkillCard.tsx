import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, IconButton } from 'react-native-paper';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { renderAppIcon } from '../AppIcon';
import { EmployeeSkill } from '../../types/skills';
import { lightTheme as theme } from '../../theme/theme';

import { SkillProficiencyRating } from './SkillProficiencyRating';

interface SkillCardProps {
  employeeSkill: EmployeeSkill;
  onEdit?: (skill: EmployeeSkill) => void;
  onDelete?: (skill: EmployeeSkill) => void;
  onPress?: (skill: EmployeeSkill) => void;
}

const getStatusColor = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'approved': return theme.colors.statusApproved;
    case 'pending': return theme.colors.statusPending;
    case 'rejected': return theme.colors.statusRejected;
    default: return theme.colors.statusDraft;
  }
};

const SkillCardComponent: React.FC<SkillCardProps> = ({ employeeSkill, onEdit, onDelete, onPress }) => {
  const skillName = employeeSkill.skill?.skillName || 'Unknown Skill';
  const categoryName = employeeSkill.skill?.category?.categoryName || 'Uncategorized';
  
  const statusColor = getStatusColor(employeeSkill.approvalStatus);
  const formattedDate = new Date(employeeSkill.updatedAt).toLocaleDateString();

  return (
    <Card style={styles.card} onPress={() => onPress && onPress(employeeSkill)}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AppText variant="h2" style={styles.title} numberOfLines={1}>{skillName}</AppText>
          {employeeSkill.isCertified && (
            <View style={styles.certBadge}>
              <AppText variant="caption" style={styles.certText}>Certified</AppText>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {onEdit && <IconButton icon={renderAppIcon("pencil")} size={20} iconColor={theme.colors.textSecondary} onPress={() => onEdit(employeeSkill)} />}
          {onDelete && <IconButton icon={renderAppIcon("delete")} size={20} iconColor={theme.colors.error} onPress={() => onDelete(employeeSkill)} />}
        </View>
      </View>

      <View style={styles.categoryRow}>
        <Chip 
          style={styles.categoryChip} 
          textStyle={styles.chipText}
          compact
        >
          {categoryName}
        </Chip>
        {employeeSkill.approvalStatus && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <AppText variant="caption" style={styles.statusText}>
              {employeeSkill.approvalStatus.toUpperCase()}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.proficiencyRow}>
        <AppText variant="caption" style={styles.detailLabel}>Proficiency</AppText>
        <SkillProficiencyRating rating={employeeSkill.proficiencyRating} readonly size={16} />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <AppText variant="caption" style={styles.detailLabel}>Experience</AppText>
          <AppText style={styles.detailValue}>{employeeSkill.yearsOfExperience || 0} years</AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" style={styles.dateText}>Last updated: {formattedDate}</AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    marginRight: 8,
  },
  certBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
  },
  certText: {
    color: '#2E7D32',
    fontFamily: theme.typography.fontFamily.bold,
  },
  actions: {
    flexDirection: 'row',
    marginRight: -16,
    marginTop: -8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: theme.colors.border,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  proficiencyRow: {
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: theme.typography.fontFamily.medium,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 12,
    marginTop: 4,
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
  },
});

export const SkillCard = memo(SkillCardComponent);
