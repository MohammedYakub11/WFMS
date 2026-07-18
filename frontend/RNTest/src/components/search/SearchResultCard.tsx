import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, Chip, useTheme } from 'react-native-paper';

interface SearchResultCardProps {
  employee: any;
  onPress: (employee: any) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ employee, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress(employee)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            {employee.profile_image ? (
              <Avatar.Image size={50} source={{ uri: employee.profile_image }} />
            ) : (
              <Avatar.Text 
                size={50} 
                label={`${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`} 
              />
            )}
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {employee.first_name} {employee.last_name}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {employee.designation || 'No Designation'} • {employee.department || 'No Department'}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text variant="titleSmall">{employee.totalSkills}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Skills</Text>
            </View>
            <View style={styles.statBox}>
              <Text variant="titleSmall">{employee.averageProficiency}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Avg Prof.</Text>
            </View>
            <View style={styles.statBox}>
              <Text variant="titleSmall">{employee.certificationsCount}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Certs</Text>
            </View>
          </View>

          {employee.primarySkills && employee.primarySkills.length > 0 && (
            <View style={styles.skillsContainer}>
              {employee.primarySkills.map((skillName: string, index: number) => (
                <Chip key={index} style={styles.chip} textStyle={{ fontSize: 10, minHeight: 12, lineHeight: 12 }}>
                  {skillName}
                </Chip>
              ))}
              {employee.totalSkills > 3 && (
                <Chip style={styles.chip} textStyle={{ fontSize: 10, minHeight: 12, lineHeight: 12 }}>
                  +{employee.totalSkills - 3} more
                </Chip>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
