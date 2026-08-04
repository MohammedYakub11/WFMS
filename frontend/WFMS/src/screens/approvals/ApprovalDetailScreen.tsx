import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { useEmployeeSkillDetail, useApproveSkill, useRejectSkill, useRequestChanges } from '../../hooks/useSkills';
import { usePermissions } from '../../hooks/usePermissions';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Cards';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';
import { lightTheme, darkTheme } from '../../theme/theme';

const STATUS_LABELS: Record<string, string> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  changes_requested: 'CHANGES REQUESTED',
};

export const ApprovalDetailScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const skillId = route.params?.id;
  const { hasPermission } = usePermissions();
  const canReview = hasPermission('EMPLOYEE_SKILL_UPDATE');

  const { data: skillDetail, isLoading, isError } = useEmployeeSkillDetail(skillId);
  const approveMutation = useApproveSkill();
  const rejectMutation = useRejectSkill();
  const requestChangesMutation = useRequestChanges();

  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'reject' | 'request-changes') => {
    if ((action === 'reject' || action === 'request-changes') && !comments.trim()) {
      Alert.alert('Comments Required', 'Please provide a comment for this action.');
      return;
    }

    setProcessing(action);
    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync({ id: skillId, comments: comments || undefined });
      } else if (action === 'reject') {
        await rejectMutation.mutateAsync({ id: skillId, comments });
      } else if (action === 'request-changes') {
        await requestChangesMutation.mutateAsync({ id: skillId, comments });
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to process approval action.');
    } finally {
      setProcessing(null);
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (isError || !skillDetail) {
    return (
      <View style={[styles.flex1, { backgroundColor: theme.colors.background }]}>
        <AppHeader title="Review Submission" showBack />
        <EmptyState title="Failed to load detail" description="An error occurred while fetching this submission." />
      </View>
    );
  }

  const skill = skillDetail.skill;
  const employee = skillDetail.employee;
  const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  const statusColor =
    skillDetail.approvalStatus === 'approved'
      ? theme.colors.statusApproved
      : skillDetail.approvalStatus === 'rejected'
      ? theme.colors.statusRejected
      : theme.colors.statusPending;

  const timelineEvents = [
    skillDetail.createdAt && {
      id: 'created',
      title: 'Skill Submitted',
      description: 'Employee submitted this skill for review.',
      timestamp: skillDetail.createdAt,
      color: theme.colors.primary,
    },
    (skillDetail as any).reviewedAt && {
      id: 'reviewed',
      title: `Skill ${STATUS_LABELS[skillDetail.approvalStatus || 'pending']}`,
      description: (skillDetail as any).reviewComments || 'Manager reviewed this submission.',
      timestamp: (skillDetail as any).reviewedAt,
      color: skillDetail.approvalStatus === 'approved' ? theme.colors.statusApproved : theme.colors.statusRejected,
    },
  ].filter(Boolean) as { id: string; title: string; description: string; timestamp: string; color: string }[];

  return (
    <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Review Submission" showBack />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <View style={styles.employeeRow}>
            <Avatar name={employeeName} uri={employee?.profile_image} size={48} />
            <View style={styles.employeeInfo}>
              <AppText variant="h3" weight="semiBold">{employeeName}</AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                {employee?.designation || 'No Designation'} · {employee?.department || 'No Department'}
              </AppText>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.flex1}>
              <AppText variant="h2">{skill?.skillName || 'Unknown Skill'}</AppText>
              <AppText variant="bodyText" color={theme.colors.textSecondary}>{skill?.category?.categoryName || 'Unknown Category'}</AppText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <AppText variant="caption" style={styles.statusText}>
                {STATUS_LABELS[skillDetail.approvalStatus || 'pending']}
              </AppText>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <AppText variant="h3" style={styles.sectionTitle}>Details</AppText>

          <View style={styles.infoRow}>
            <AppText variant="bodyText" color={theme.colors.textSecondary} style={styles.infoLabel}>Proficiency</AppText>
            <SkillProficiencyRating rating={skillDetail.proficiencyRating} readonly size={16} />
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}>
            <AppText variant="bodyText" color={theme.colors.textSecondary} style={styles.infoLabel}>Experience</AppText>
            <AppText variant="bodyText">{skillDetail.yearsOfExperience ?? 0} years</AppText>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}>
            <AppText variant="bodyText" color={theme.colors.textSecondary} style={styles.infoLabel}>Last Used</AppText>
            <AppText variant="bodyText">{skillDetail.lastUsedDate ? String(skillDetail.lastUsedDate).split('T')[0] : 'N/A'}</AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="bodyText" color={theme.colors.textSecondary} style={styles.infoLabel}>Submitted</AppText>
            <AppText variant="bodyText">
              {skillDetail.submittedAt ? new Date(skillDetail.submittedAt).toLocaleDateString() : new Date(skillDetail.createdAt).toLocaleDateString()}
            </AppText>
          </View>
        </Card>

        {skillDetail.isCertified && (
          <Card style={styles.card}>
            <AppText variant="h3" style={styles.sectionTitle}>Certification</AppText>
            <View style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}>
              <AppText variant="bodyText" color={theme.colors.textSecondary} style={styles.infoLabel}>Name</AppText>
              <AppText variant="bodyText" style={styles.flex1}>{(skillDetail as any).certificationName}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText variant="bodyText" color={theme.colors.textSecondary} style={styles.infoLabel}>Issuer</AppText>
              <AppText variant="bodyText" style={styles.flex1}>{(skillDetail as any).issuingOrganization}</AppText>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <AppText variant="h3" style={styles.sectionTitle}>Audit Timeline</AppText>
          {timelineEvents.map((event) => (
            <View key={event.id} style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: event.color }]} />
              <View style={styles.flex1}>
                <AppText variant="bodyText" weight="semiBold">{event.title}</AppText>
                <AppText variant="caption" color={theme.colors.textSecondary}>{event.description}</AppText>
                <AppText variant="caption" color={theme.colors.textSecondary}>{new Date(event.timestamp).toLocaleString()}</AppText>
              </View>
            </View>
          ))}
        </Card>

        {canReview && skillDetail.approvalStatus === 'pending' && (
          <Card style={[styles.card, styles.reviewCard, { borderColor: theme.colors.primary }]}>
            <AppText variant="h3" style={styles.sectionTitle}>Manager Review</AppText>
            <AppTextField
              label="Review Comments (required for Reject / Request Changes)"
              placeholder="Add your feedback..."
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
              style={styles.reviewInput}
            />
            <View style={styles.actionRow}>
              <SecondaryButton
                title="Request Changes"
                onPress={() => handleAction('request-changes')}
                isLoading={processing === 'request-changes'}
                disabled={processing !== null}
                style={styles.actionBtn}
              />
              <SecondaryButton
                title="Reject"
                onPress={() => handleAction('reject')}
                isLoading={processing === 'reject'}
                disabled={processing !== null}
                style={[styles.actionBtn, { backgroundColor: theme.colors.error + '1A' }]}
              />
              <PrimaryButton
                title="Approve"
                onPress={() => handleAction('approve')}
                isLoading={processing === 'approve'}
                disabled={processing !== null}
                style={styles.actionBtn}
              />
            </View>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 0,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  infoLabel: {
    width: 110,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 12,
  },
  reviewCard: {
    borderWidth: 1,
  },
  reviewInput: {
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 44,
  },
  bottomSpacer: {
    height: 40,
  },
});
