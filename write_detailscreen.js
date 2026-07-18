const fs = require('fs');

const skillDetailsScreen = `import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Button, useTheme, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEmployeeSkillDetail } from '../../hooks/useSkills';
import { Timeline, TimelineEvent } from '../../components/common/Timeline';
import { EmployeeSkill } from '../../types/skills';

export const SkillDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  const skillId = route.params?.id;

  const { data: skillDetail, isLoading, isError, error, refetch, isFetching } = useEmployeeSkillDetail(skillId);

  // Generate timeline events from dates
  const timelineEvents = useMemo(() => {
    if (!skillDetail) return [];
    
    const events: TimelineEvent[] = [];
    
    if (skillDetail.createdAt) {
      events.push({
        id: 'created',
        title: 'Skill Created',
        timestamp: skillDetail.createdAt,
        icon: 'star',
        color: theme.colors.primary,
        description: 'Employee initially declared this skill.'
      });
    }

    if (skillDetail.updatedAt && skillDetail.updatedAt !== skillDetail.createdAt) {
      events.push({
        id: 'updated',
        title: 'Skill Updated',
        timestamp: skillDetail.updatedAt,
        icon: 'pencil',
        color: theme.colors.secondary,
        description: 'Details for this skill were modified.'
      });
    }

    // Sort descending
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
        <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 16 }}>
          Failed to load skill details.
        </Text>
        <Text style={{ marginBottom: 24 }}>{(error as any)?.message}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  const {
    skill,
    proficiencyRating,
    yearsOfExperience,
    lastUsedDate,
    isCertified,
    certificationName,
    issuingOrganization,
    issueDate,
    expiryDate,
    approvalStatus,
    remarks,
    createdAt,
    updatedAt
  } = skillDetail;

  const categoryName = (skill as any)?.category?.categoryName || 'Unknown Category';
  const skillName = skill?.skillName || 'Unknown Skill';

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return theme.colors.surfaceVariant;
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      {/* SECTION 1: HEADER */}
      <Card style={styles.card}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{skillName}</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>{categoryName}</Text>
            </View>
            <Avatar.Icon size={48} icon="star-circle" />
          </View>
          
          <View style={styles.badgesRow}>
            <Chip style={styles.chip} textStyle={{ fontWeight: 'bold' }}>Level {proficiencyRating}/5</Chip>
            <Chip 
              style={[styles.chip, { backgroundColor: getStatusColor(approvalStatus) }]} 
              textStyle={{ color: '#fff', fontWeight: 'bold' }}
            >
              {approvalStatus.toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* SECTION 2: INFORMATION */}
      <Card style={styles.card}>
        <Card.Title title="Skill Information" titleVariant="titleLarge" />
        <Divider />
        <Card.Content style={styles.infoContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Years of Experience:</Text>
            <Text style={styles.infoValue}>{yearsOfExperience != null ? \`\${yearsOfExperience} years\` : 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Used:</Text>
            <Text style={styles.infoValue}>{lastUsedDate ? new Date(lastUsedDate).toLocaleDateString() : 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Declared Date:</Text>
            <Text style={styles.infoValue}>{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* SECTION 3: CERTIFICATION */}
      <Card style={styles.card}>
        <Card.Title title="Certification" titleVariant="titleLarge" />
        <Divider />
        <Card.Content style={styles.infoContent}>
          {isCertified ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{certificationName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Issuing Org:</Text>
                <Text style={styles.infoValue}>{issuingOrganization}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Issue Date:</Text>
                <Text style={styles.infoValue}>{issueDate ? new Date(issueDate).toLocaleDateString() : 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expiry Date:</Text>
                <Text style={styles.infoValue}>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </>
          ) : (
            <Text style={{ fontStyle: 'italic', marginTop: 8 }}>No certification available.</Text>
          )}
        </Card.Content>
      </Card>

      {/* SECTION 4: MANAGER REVIEW */}
      <Card style={styles.card}>
        <Card.Title title="Manager Review" titleVariant="titleLarge" />
        <Divider />
        <Card.Content style={styles.infoContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{approvalStatus}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Comments:</Text>
            <Text style={styles.infoValue}>{remarks || 'No remarks provided.'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* SECTION 5: TIMELINE */}
      <Card style={styles.card}>
        <Card.Title title="Timeline" titleVariant="titleLarge" />
        <Divider />
        <Card.Content style={{ paddingTop: 16 }}>
          <Timeline events={timelineEvents} />
        </Card.Content>
      </Card>

      {/* SECTION 6: AUDIT INFORMATION */}
      <Card style={styles.card}>
        <Card.Title title="Audit Information" titleVariant="titleLarge" />
        <Divider />
        <Card.Content style={styles.infoContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created At:</Text>
            <Text style={styles.infoValue}>{createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* SECTION 7: ATTACHMENTS (Placeholder) */}
      <Card style={styles.card}>
        <Card.Title title="Attachments" titleVariant="titleLarge" icon="paperclip" />
        <Divider />
        <Card.Content style={{ paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ fontStyle: 'italic', textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            Attachments will be available in a future release.
          </Text>
        </Card.Content>
      </Card>

      {/* ACTIONS */}
      <View style={styles.actionsContainer}>
        {approvalStatus !== 'approved' && (
          <Button 
            mode="contained" 
            style={styles.actionButton}
            icon="pencil"
            onPress={() => console.log('Edit skill', skillId)}
          >
            Edit Skill
          </Button>
        )}
        <Button 
          mode="outlined" 
          style={styles.actionButton}
          icon="keyboard-backspace"
          onPress={() => navigation.goBack()}
        >
          Back
        </Button>
      </View>

    </ScrollView>
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
    padding: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
  },
  infoContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    flex: 1,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    flex: 2,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
  }
});
`;

fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\SkillDetailsScreen.tsx', skillDetailsScreen);
console.log('Successfully wrote SkillDetailsScreen.tsx');
