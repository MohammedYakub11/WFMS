import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import {
  useSkillAdmin,
  useActivateSkillAdmin,
  useDeactivateSkillAdmin,
  useDeleteSkillAdmin,
  useRestoreSkillAdmin,
} from '../../hooks/useSkillsAdmin';
import { usePermissions } from '../../hooks/usePermissions';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const SkillAdminDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { skillId } = route.params;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const { data: skill, isLoading, isError, refetch } = useSkillAdmin(skillId);

  const activateMutation = useActivateSkillAdmin();
  const deactivateMutation = useDeactivateSkillAdmin();
  const deleteMutation = useDeleteSkillAdmin();
  const restoreMutation = useRestoreSkillAdmin();

  const [confirmAction, setConfirmAction] = useState<'delete' | 'restore' | null>(null);

  const canUpdate = hasPermission('SKILL_UPDATE');
  const canDelete = hasPermission('SKILL_DELETE');

  const handleToggleStatus = () => {
    if (!skill) return;
    const mutation = skill.isActive ? deactivateMutation : activateMutation;
    mutation.mutate(skillId, {
      onSuccess: () => showSnackbar(`Skill ${skill.isActive ? 'deactivated' : 'activated'}`, 'success'),
      onError: () => showSnackbar('Failed to update skill status', 'error'),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(skillId, {
      onSuccess: () => {
        showSnackbar('Skill deleted', 'success');
        setConfirmAction(null);
        navigation.goBack();
      },
      onError: () => {
        showSnackbar('Failed to delete skill', 'error');
        setConfirmAction(null);
      },
    });
  };

  const handleRestore = () => {
    restoreMutation.mutate(skillId, {
      onSuccess: () => {
        showSnackbar('Skill restored', 'success');
        setConfirmAction(null);
      },
      onError: () => {
        showSnackbar('Failed to restore skill', 'error');
        setConfirmAction(null);
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Skill Details" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !skill) {
    return (
      <View style={styles.container}>
        <AppHeader title="Skill Details" showBack />
        <EmptyState
          title="Unable to load skill"
          description="We couldn't fetch this skill's details. Please try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const isDeleted = !!skill.deletedAt;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Skill Details"
        showBack
        rightAction={
          canUpdate && !isDeleted ? (
            <AppText
              variant="buttonText"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('SkillForm', { skillId })}
            >
              Edit
            </AppText>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <AppText variant="h1">{skill.skillName}</AppText>
          {!!skill.skillCode && (
            <AppText color={theme.colors.textSecondary}>{skill.skillCode}</AppText>
          )}
          <View style={[styles.statusBadge, { backgroundColor: skill.isActive ? theme.colors.statusActive : theme.colors.statusDisabled }]}>
            <AppText variant="caption" style={styles.statusText}>
              {isDeleted ? 'Deleted' : skill.isActive ? 'Active' : 'Inactive'}
            </AppText>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Overview</AppText>
          <InfoRow label="Skill Name" value={skill.skillName} theme={theme} />
          <InfoRow label="Skill Code" value={skill.skillCode || '—'} theme={theme} />
          <InfoRow label="Category" value={skill.category?.categoryName || '—'} theme={theme} />
          <InfoRow label="Required Certification" value={skill.requiredCertification || '—'} theme={theme} />
          <InfoRow label="Description" value={skill.description || '—'} theme={theme} />
        </Card>

        {/* TODO: audit timeline — no useSkillAuditLog hook/backend contract exists yet for skills. */}

        {canUpdate && !isDeleted && (
          <Card style={styles.sectionCard}>
            <View style={styles.toggleRow}>
              <AppText weight="semiBold">{skill.isActive ? 'Deactivate Skill' : 'Activate Skill'}</AppText>
              <Switch
                value={skill.isActive}
                onValueChange={handleToggleStatus}
                trackColor={{ true: theme.colors.primary }}
              />
            </View>
          </Card>
        )}

        {canDelete && (
          <Card style={styles.sectionCard}>
            <AppText
              variant="buttonText"
              color={theme.colors.error}
              weight="semiBold"
              onPress={() => setConfirmAction(isDeleted ? 'restore' : 'delete')}
            >
              {isDeleted ? 'Restore Skill' : 'Delete Skill'}
            </AppText>
          </Card>
        )}
      </ScrollView>

      <ConfirmationDialog
        visible={confirmAction === 'delete'}
        title="Delete Skill"
        message={`Are you sure you want to delete ${skill.skillName}? This can be undone via Restore.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onDismiss={() => setConfirmAction(null)}
      />
      <ConfirmationDialog
        visible={confirmAction === 'restore'}
        title="Restore Skill"
        message={`Restore ${skill.skillName}?`}
        confirmLabel="Restore"
        isLoading={restoreMutation.isPending}
        onConfirm={handleRestore}
        onDismiss={() => setConfirmAction(null)}
      />
    </View>
  );
};

const InfoRow = ({ label, value, theme }: { label: string; value: string; theme: typeof lightTheme }) => (
  <View style={styles.infoRow}>
    <AppText variant="caption" color={theme.colors.textSecondary}>{label}</AppText>
    <AppText>{value}</AppText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 6 },
  statusText: { color: '#FFFFFF' },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 12 },
  infoRow: { marginBottom: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
