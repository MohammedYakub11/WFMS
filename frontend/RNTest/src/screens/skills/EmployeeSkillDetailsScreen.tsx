import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Button, Divider, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEmployeeSkillDetail, useDeleteEmployeeSkill } from '../../hooks/useSkills';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';
import { SkillTimeline } from '../../components/common/SkillTimeline';

export const EmployeeSkillDetailsScreen = () => {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const { data: skill, isLoading, error } = useEmployeeSkillDetail(id);
  const deleteMutation = useDeleteEmployeeSkill();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error || !skill) return <Text style={{ padding: 16 }}>Error loading skill details.</Text>;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const timelineEvents = [
    { id: '1', title: 'Skill Added', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', title: 'Approved by Manager', timestamp: new Date().toISOString() },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>{skill.skill?.name || 'Unknown Skill'}</Text>
        {skill.isPrimary && <Chip icon="star" style={styles.primaryChip}>Primary</Chip>}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Proficiency</Text>
        <SkillProficiencyRating rating={skill.proficiencyRating} readonly />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Experience</Text>
        <Text variant="bodyLarge">{skill.yearsOfExperience} years</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Status</Text>
        <Text variant="bodyLarge">{skill.status}</Text>
      </View>

      <Divider style={styles.divider} />

      {skill.notes && (
        <>
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Notes</Text>
            <Text variant="bodyMedium">{skill.notes}</Text>
          </View>
          <Divider style={styles.divider} />
        </>
      )}

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>History</Text>
        <SkillTimeline events={timelineEvents} />
      </View>

      <View style={styles.actionButtons}>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('EditSkill', { id })}
          style={styles.button}
        >
          Edit
        </Button>
        <Button 
          mode="contained" 
          buttonColor={theme.colors.error}
          onPress={handleDelete}
          loading={deleteMutation.isPending}
          disabled={deleteMutation.isPending}
          style={styles.button}
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  primaryChip: {
    marginLeft: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    height: 1,
  },
  actionButtons: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
