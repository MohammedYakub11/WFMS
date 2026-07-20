import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';
import { useEmployeeSkillDetail, useDeleteEmployeeSkill } from '../../hooks/useSkills';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';
import { SkillTimeline } from '../../components/common/SkillTimeline';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Cards';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { lightTheme } from '../../theme/theme';

export const EmployeeSkillDetailsScreen = () => {
  
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const { data: skillResponse, isLoading, error } = useEmployeeSkillDetail(id);
  const deleteMutation = useDeleteEmployeeSkill();
  
  const skill = skillResponse?.data;

  if (isLoading) return <Loader style={styles.loader} />;
  if (error || !skill) return (
    <View style={styles.container}>
      <AppHeader title="Skill Details" showBack />
      <EmptyState
        title="Error loading details"
        description="We couldn't fetch the details for this skill."
        actionTitle="Go Back"
        onAction={() => navigation.goBack()}
      />
    </View>
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Skill",
      "Are you sure you want to delete this skill?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
              navigation.goBack();
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };

  const timelineEvents = [
    { id: '1', title: 'Skill Added', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', title: 'Approved by Manager', timestamp: new Date().toISOString() },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Skill Profile" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <AppText variant="h1" style={styles.title}>{skill.skill?.skillName || skill.skill?.name || 'Unknown Skill'}</AppText>
          {skill.isCertified && (
            <View style={styles.certBadge}>
              <AppText variant="caption" style={styles.certText}>Certified</AppText>
            </View>
          )}
        </View>

        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>Skill Information</AppText>
          
          <View style={styles.detailRow}>
            <AppText variant="caption" style={styles.detailLabel}>Category</AppText>
            <AppText style={styles.detailValue}>{skill.skill?.category?.categoryName || 'Uncategorized'}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText variant="caption" style={styles.detailLabel}>Proficiency</AppText>
            <SkillProficiencyRating rating={skill.proficiencyRating} readonly />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>Experience & Status</AppText>
          
          <View style={styles.detailRow}>
            <AppText variant="caption" style={styles.detailLabel}>Years of Experience</AppText>
            <AppText style={styles.detailValue}>{skill.yearsOfExperience || 0} years</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="caption" style={styles.detailLabel}>Approval Status</AppText>
            <AppText style={styles.detailValue}>
              {skill.approvalStatus ? skill.approvalStatus.toUpperCase() : 'PENDING'}
            </AppText>
          </View>
          
          {skill.notes && (
            <View style={styles.detailRow}>
              <AppText variant="caption" style={styles.detailLabel}>Notes</AppText>
              <AppText style={styles.detailValue}>{skill.notes}</AppText>
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>History</AppText>
          <SkillTimeline events={timelineEvents} />
        </Card>

      </ScrollView>
      
      <View style={styles.actionButtons}>
        <View style={styles.buttonWrapper}>
          <SecondaryButton 
            title="Delete" 
            onPress={handleDelete}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <PrimaryButton 
            title="Edit Skill" 
            onPress={() => navigation.navigate('EditSkill', { id })}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    flex: 1,
  },
  certBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  certText: {
    color: '#2E7D32',
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: lightTheme.colors.primary,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    color: lightTheme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: lightTheme.typography.fontFamily.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: lightTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.divider,
    gap: 16,
  },
  buttonWrapper: {
    flex: 1,
  },
});
