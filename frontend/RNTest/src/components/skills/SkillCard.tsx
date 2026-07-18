import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, useTheme, MD3Theme } from 'react-native-paper';
import { EmployeeSkill } from '../../types/skills';

interface SkillCardProps {
  employeeSkill: EmployeeSkill;
  onEdit?: (skill: EmployeeSkill) => void;
  onDelete?: (skill: EmployeeSkill) => void;
  onPress?: (skill: EmployeeSkill) => void;
}

const getStatusColor = (status: string | undefined, theme: MD3Theme) => {
  switch (status) {
    case 'approved': return theme.colors.primary;
    case 'pending': return theme.colors.tertiary;
    case 'rejected': return theme.colors.error;
    default: return theme.colors.secondary;
  }
};

const SkillCardComponent: React.FC<SkillCardProps> = ({ employeeSkill, onEdit, onDelete, onPress }) => {
  const theme = useTheme();
  
  const skillName = employeeSkill.skill?.skillName || 'Unknown Skill';
  const categoryName = employeeSkill.skill?.category?.categoryName || 'Uncategorized';
  
  const statusColor = getStatusColor(employeeSkill.approvalStatus, theme);
  const formattedDate = new Date(employeeSkill.updatedAt).toLocaleDateString();

  return (
    <Card style={styles.card} onPress={() => onPress && onPress(employeeSkill)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title} numberOfLines={1}>{skillName}</Text>
            {employeeSkill.isCertified && (
              <Chip icon="certificate" compact style={styles.certChip} textStyle={styles.certText}>
                Certified
              </Chip>
            )}
          </View>
          <View style={styles.actions}>
            {onEdit && <IconButton icon="pencil" size={20} onPress={() => onEdit(employeeSkill)} />}
            {onDelete && <IconButton icon="delete" size={20} iconColor={theme.colors.error} onPress={() => onDelete(employeeSkill)} />}
          </View>
        </View>

        <View style={styles.categoryRow}>
          <Chip style={styles.categoryChip}>{categoryName}</Chip>
          {employeeSkill.approvalStatus && (
            <Chip style={[styles.statusChip, { backgroundColor: statusColor }]} textStyle={styles.statusText}>
              {employeeSkill.approvalStatus.toUpperCase()}
            </Chip>
          )}
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>Proficiency</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <IconButton 
                  key={i} 
                  icon={i < employeeSkill.proficiencyRating ? "star" : "star-outline"} 
                  size={16} 
                  style={styles.starIcon}
                  iconColor={i < employeeSkill.proficiencyRating ? "#FFD700" : theme.colors.outline}
                />
              ))}
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>Experience</Text>
            <Text variant="bodyMedium">{employeeSkill.yearsOfExperience || 0} years</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.dateText}>Last updated: {formattedDate}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  certChip: {
    backgroundColor: '#E8F5E9',
    height: 24,
  },
  certText: {
    fontSize: 10,
    color: '#2E7D32',
  },
  actions: {
    flexDirection: 'row',
    marginRight: -16,
    marginTop: -16,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
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
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginLeft: -12, // adjust for icon button padding
  },
  starIcon: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 4,
  },
  dateText: {
    color: '#888',
    fontStyle: 'italic',
  }
});

export const SkillCard = memo(SkillCardComponent);
