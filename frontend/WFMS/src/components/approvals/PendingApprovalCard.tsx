import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { Avatar } from '../Avatar';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { SkillProficiencyRating } from '../skills/SkillProficiencyRating';
import { EmployeeSkill } from '../../types/skills';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface PendingApprovalCardProps {
  employeeSkill: EmployeeSkill;
  onPress: (item: EmployeeSkill) => void;
  onApprove: (item: EmployeeSkill) => void;
  onReject: (item: EmployeeSkill) => void;
  onRequestChanges: (item: EmployeeSkill) => void;
  canReview: boolean;
  isApproving?: boolean;
}

export const PendingApprovalCard: React.FC<PendingApprovalCardProps> = ({
  employeeSkill,
  onPress,
  onApprove,
  onReject,
  onRequestChanges,
  canReview,
  isApproving,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const employee = employeeSkill.employee;
  const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  const skillName = employeeSkill.skill?.skillName || 'Unknown Skill';
  const categoryName = employeeSkill.skill?.category?.categoryName || 'Uncategorized';
  const submittedDate = employeeSkill.submittedAt || employeeSkill.createdAt;
  const isResubmission = !!employeeSkill.previousStatus;

  return (
    <Card style={styles.card} onPress={() => onPress(employeeSkill)}>
      <View style={styles.content}>
        <View style={styles.employeeRow}>
          <Avatar name={employeeName} uri={employee?.profile_image} size={40} />
          <View style={styles.employeeInfo}>
            <AppText variant="cardTitle" weight="semiBold" numberOfLines={1}>{employeeName}</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              ID: {employee?.employee_code || 'N/A'} · {employee?.department || 'No Dept'}
            </AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isResubmission ? theme.colors.statusDraft : theme.colors.statusPending }]}>
            <AppText variant="caption" style={styles.statusText}>
              {isResubmission ? 'RESUBMITTED' : 'NEW'}
            </AppText>
          </View>
        </View>

        <View style={styles.skillRow}>
          <AppText variant="bodyText" weight="semiBold" numberOfLines={1}>{skillName}</AppText>
          <Chip style={styles.categoryChip} textStyle={styles.chipText} compact>
            {categoryName}
          </Chip>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <AppText variant="caption" style={styles.detailLabel} color={theme.colors.textSecondary}>Proficiency</AppText>
            <SkillProficiencyRating rating={employeeSkill.proficiencyRating} readonly size={16} />
          </View>
          <View style={styles.detailCol}>
            <AppText variant="caption" style={styles.detailLabel} color={theme.colors.textSecondary}>Experience</AppText>
            <AppText variant="bodyText">{employeeSkill.yearsOfExperience || 0} yrs</AppText>
          </View>
          <View style={styles.detailColRight}>
            <AppText variant="caption" style={styles.detailLabel} color={theme.colors.textSecondary}>Submitted</AppText>
            <AppText variant="bodyText">{submittedDate ? new Date(submittedDate).toLocaleDateString() : 'N/A'}</AppText>
          </View>
        </View>

        {canReview && (
          <View style={styles.actionsWrapper}>
            <SecondaryButton
              title="Request Changes"
              onPress={() => onRequestChanges(employeeSkill)}
              style={styles.fullWidthAction}
            />
            <View style={styles.actionsRow}>
              <SecondaryButton
                title="Reject"
                onPress={() => onReject(employeeSkill)}
                style={styles.actionBtn}
              />
              <PrimaryButton
                title="Approve"
                onPress={() => onApprove(employeeSkill)}
                isLoading={isApproving}
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
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
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  chipText: {
    fontSize: 11,
    color: lightTheme.colors.textSecondary,
    fontFamily: lightTheme.typography.fontFamily.medium,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: lightTheme.radius.m,
    marginBottom: 16,
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
  actionsWrapper: {
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthAction: {
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
});
