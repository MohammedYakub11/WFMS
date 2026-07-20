import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Avatar, useTheme, Chip, Divider, Button } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useEmployeeProfile } from '../../hooks/useEmployee';
import { useNavigation } from '@react-navigation/native';

export const EmployeePreviewScreen = () => {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { employeeId, employeeData } = route.params;

  const { data: fullEmployeeData, isLoading } = useEmployeeProfile(employeeId);
  const employee = fullEmployeeData?.data || employeeData;

  const loading = isLoading && !employeeData?.employeeSkills; // Show loading if no fallback data

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          {employee.profile_image ? (
            <Avatar.Image size={80} source={{ uri: employee.profile_image }} />
          ) : (
            <Avatar.Text size={80} label={`${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`} />
          )}
          <Text variant="headlineSmall" style={styles.name}>
            {employee.first_name} {employee.last_name}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {employee.designation || 'No Designation'}
          </Text>
          <View style={styles.infoRow}>
            <Chip icon="office-building" style={styles.infoChip}>{employee.department || 'N/A'}</Chip>
            <Chip icon="map-marker" style={styles.infoChip}>{employee.location || 'N/A'}</Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Skill Summary</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{employee.totalSkills || 0}</Text>
              <Text variant="bodySmall">Total Skills</Text>
            </View>
            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>{employee.averageProficiency || 0}</Text>
              <Text variant="bodySmall">Avg. Proficiency</Text>
            </View>
            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>{employee.certificationsCount || 0}</Text>
              <Text variant="bodySmall">Certifications</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Primary Skills</Text>
          <View style={styles.skillsContainer}>
            {employee.primarySkills?.map((skill: string, index: number) => (
              <Chip key={index} style={styles.skillChip}>{skill}</Chip>
            ))}
            {(!employee.primarySkills || employee.primarySkills.length === 0) && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No skills available.</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={{ padding: 16 }}>
        <Button mode="contained" onPress={() => navigation.navigate('EmployeeDetails', { employeeId })}>
          View Full Profile
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  infoChip: {
    backgroundColor: 'transparent',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 8,
  },
  container: {
    padding: 16,
  }
});