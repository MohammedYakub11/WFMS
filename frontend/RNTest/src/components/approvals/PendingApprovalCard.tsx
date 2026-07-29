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
      <View style={styles.employeeRow}>
        <Avatar name={employeeName} uri={employee?.profile_image} size={40} />
        <View style={styles.employeeInfo}>
          <AppText variant="cardTitle" weight="semiBold" numberOfLines={1}>{employeeName}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            ID: {employee?.employee_code || 'N/A'} · {employee?.department || 'No Department'}
          </AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isResubmission ? theme.colors.statusDraft : theme.colors.statusPending }]}>
          <AppText variant="caption" style={styles.statusText}>
            {isResubmission ? 'RESUBMITTED' : 'NEW'}
          </AppText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

      <View style={styles.skillRow}>
        <View style={styles.flex1}>
          <AppText variant="bodyText" weight="semiBold" numberOfLines={1}>{skillName}</AppText>
          <Chip style={[styles.categoryChip, { backgroundColor: theme.colors.border }]} textStyle={styles.chipText} compact>
            {categoryName}
          </Chip>
        </View>
      </View>

      <View style={styles.proficiencyRow}>
        <AppText variant="caption" style={styles.detailLabel} color={theme.colors.textSecondary}>Proficiency</AppText>
        <SkillProficiencyRating rating={employeeSkill.proficiencyRating} readonly size={14} />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <AppText variant="caption" style={styles.detailLabel} color={theme.colors.textSecondary}>Experience</AppText>
          <AppText variant="bodyText">{employeeSkill.yearsOfExperience || 0} years</AppText>
        </View>
        <View style={styles.detailItem}>
          <AppText variant="caption" style={styles.detailLabel} color={theme.colors.textSecondary}>Submitted</AppText>
          <AppText variant="bodyText">{submittedDate ? new Date(submittedDate).toLocaleDateString() : 'N/A'}</AppText>
        </View>
      </View>

      {canReview && (
        <View style={[styles.actionsRow, { borderTopColor: theme.colors.divider }]}>
          <SecondaryButton
            title="Request Changes"
            onPress={() => onRequestChanges(employeeSkill)}
            style={styles.actionBtn}
          />
          <SecondaryButton
            title="Reject"
            onPress={() => onReject(employeeSkill)}
            style={[styles.actionBtn, { backgroundColor: theme.colors.error + '1A' }]}
          />
          <PrimaryButton
            title="Approve"
            onPress={() => onApprove(employeeSkill)}
            isLoading={isApproving}
            style={styles.actionBtn}
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeInfo: {
    flex: 1,
    marginLeft: 12,
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
  divider: {
    height: 1,
    marginVertical: 12,
  },
  skillRow: {
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
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
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    height: 40,
  },
});
