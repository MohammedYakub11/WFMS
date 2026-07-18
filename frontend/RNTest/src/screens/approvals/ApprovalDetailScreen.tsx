import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Card, Button, ActivityIndicator, TextInput, Avatar, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEmployeeSkillDetail, useApproveSkill, useRejectSkill, useRequestChanges } from '../../hooks/useSkills';
import { SkillTimeline as Timeline, TimelineEvent } from '../../components/common/SkillTimeline';

export const ApprovalDetailScreen = () => {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const skillId = route.params?.id;

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
        await approveMutation.mutateAsync({ id: skillId, comments });
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

  const skill = skillDetail?.skill as any;
  const employee = skillDetail?.employee as any;

  // Generate timeline events from dates
  const timelineEvents = React.useMemo(() => {
    if (!skillDetail) return [];
    const events: TimelineEvent[] = [];
    if (skillDetail.createdAt) {
      events.push({
        id: 'created',
        title: 'Skill Submitted',
        timestamp: skillDetail.createdAt,
        icon: 'star',
        color: theme.colors.primary,
        description: 'Employee submitted this skill for review.'
      });
    }
    if (skillDetail.reviewedAt) {
      events.push({
        id: 'reviewed',
        title: `Skill ${skillDetail.approvalStatus === 'approved' ? 'Approved' : skillDetail.approvalStatus === 'rejected' ? 'Rejected' : 'Reviewed'}`,
        timestamp: skillDetail.reviewedAt,
        icon: skillDetail.approvalStatus === 'approved' ? 'check' : 'close',
        color: skillDetail.approvalStatus === 'approved' ? '#4CAF50' : theme.colors.error,
        description: skillDetail.reviewComments || 'Manager reviewed this skill.'
      });
    }
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [skillDetail, theme]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !skillDetail) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Failed to load detail.</Text>
      </View>
    );
  }



  return (
    <KeyboardAvoidingView 
      style={styles.flex1} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        {/* Employee Info */}
        <Card style={styles.card}>
          <Card.Title
            title={`${employee?.first_name || 'Unknown'} ${employee?.last_name || 'Employee'}`}
            subtitle={`${employee?.designation || 'No Designation'} • ${employee?.department || 'No Dept'}`}
            left={(props) => <Avatar.Text {...props} label={(employee?.first_name?.[0] || 'U')} />}
          />
        </Card>

        {/* Skill Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.flex1}>
                <Text variant="titleLarge" style={styles.boldText}>{skill?.skillName || 'Unknown Skill'}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{skill?.category?.categoryName || 'Unknown Category'}</Text>
              </View>
              <Chip>{skillDetail.approvalStatus?.toUpperCase() || 'PENDING'}</Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Skill Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>Proficiency</Text>
              <Text variant="bodyLarge">{skillDetail.proficiencyRating} / 5</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>Experience</Text>
              <Text variant="bodyLarge">{skillDetail.yearsOfExperience ?? 0} years</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>Last Used</Text>
              <Text variant="bodyLarge">{skillDetail.lastUsedDate ? String(skillDetail.lastUsedDate).split('T')[0] : 'N/A'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Certification (Conditional) */}
        {skillDetail.isCertified && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Certification</Text>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Name</Text>
                <Text variant="bodyLarge" style={styles.flex1}>{skillDetail.certificationName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Issuer</Text>
                <Text variant="bodyLarge" style={styles.flex1}>{skillDetail.issuingOrganization}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Audit Timeline */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Audit Timeline</Text>
            <Timeline events={timelineEvents} />
          </Card.Content>
        </Card>

        {/* Review Panel */}
        {skillDetail.approvalStatus === 'pending' && (
          <Card style={[styles.card, { borderColor: theme.colors.primary, borderWidth: 1 }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Manager Review</Text>
              <TextInput
                label="Review Comments (Required for Reject/Changes)"
                mode="outlined"
                multiline
                numberOfLines={3}
                value={comments}
                onChangeText={setComments}
                style={styles.reviewInput}
              />
              <View style={styles.actionRow}>
                <Button 
                  mode="contained" 
                  buttonColor={theme.colors.error}
                  onPress={() => handleAction('reject')}
                  loading={processing === 'reject'}
                  disabled={processing !== null}
                  style={styles.actionBtn}
                >
                  Reject
                </Button>
                <Button 
                  mode="contained-tonal"
                  onPress={() => handleAction('request-changes')}
                  loading={processing === 'request-changes'}
                  disabled={processing !== null}
                  style={styles.actionBtn}
                >
                  Request Changes
                </Button>
                <Button 
                  mode="contained"
                  buttonColor="#4CAF50"
                  onPress={() => handleAction('approve')}
                  loading={processing === 'approve'}
                  disabled={processing !== null}
                  style={styles.actionBtn}
                >
                  Approve
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  infoLabel: {
    width: 120,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold', 
    marginBottom: 12,
  },
  reviewInput: {
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 40,
  }
});
