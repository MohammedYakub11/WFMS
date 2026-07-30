import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Card, NeuIconCircle } from '../Cards';
import { AppText } from '../AppText';
import { AppIcon } from '../AppIcon';
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
      <View style={styles.content}>
        
        {/* Top Row: Icon, Title, Tags, Actions */}
        <View style={styles.topRow}>
          <NeuIconCircle size={48} style={styles.iconContainer}>
            <AppIcon name="star" size={24} color={theme.colors.primary} />
          </NeuIconCircle>

          <View style={styles.titleWrapper}>
            <AppText variant="cardTitle" weight="semiBold" numberOfLines={1}>{skillName}</AppText>
            <View style={styles.tagsRow}>
              <Chip style={styles.categoryChip} textStyle={styles.chipText} compact>
                {categoryName}
              </Chip>
              {employeeSkill.approvalStatus && (
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <AppText variant="caption" style={styles.statusText}>
                    {employeeSkill.approvalStatus.toUpperCase()}
                  </AppText>
                </View>
              )}
              {employeeSkill.isCertified && (
                <View style={styles.certBadge}>
                  <AppText variant="caption" style={styles.certText}>Certified</AppText>
                </View>
              )}
            </View>
          </View>

          {(onEdit || onDelete) && (
            <View style={styles.actionsContainer}>
              {onEdit && (
                <NeuIconCircle size={40} onPress={() => onEdit(employeeSkill)}>
                  <AppIcon name="pencil" size={16} color={theme.colors.textSecondary} />
                </NeuIconCircle>
              )}
              {onDelete && (
                <NeuIconCircle size={40} style={styles.actionButtonMargin} onPress={() => onDelete(employeeSkill)}>
                  <AppIcon name="delete" size={16} color={theme.colors.error} />
                </NeuIconCircle>
              )}
            </View>
          )}
        </View>

        {/* Bottom Row: Rating, Experience, Last Updated */}
        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.detailLabel}>Proficiency</AppText>
            <SkillProficiencyRating rating={employeeSkill.proficiencyRating} readonly size={16} />
          </View>
          
          <View style={styles.detailCol}>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.detailLabel}>Experience</AppText>
            <AppText variant="bodyText">{employeeSkill.yearsOfExperience || 0} yrs</AppText>
          </View>

          <View style={styles.detailColRight}>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.detailLabel}>Last updated</AppText>
            <AppText variant="bodyText">{formattedDate}</AppText>
          </View>
        </View>

      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    paddingVertical: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  categoryChip: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  certBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  certText: {
    color: '#2E7D32',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButtonMargin: {
    marginLeft: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: theme.radius.m,
  },
  detailCol: {
    flexGrow: 1,
    flexBasis: '40%',
    minWidth: 100,
  },
  detailColRight: {
    flexGrow: 1,
    flexBasis: '40%',
    minWidth: 100,
  },
  detailLabel: {
    marginBottom: 4,
  },
});

export const SkillCard = memo(SkillCardComponent);
