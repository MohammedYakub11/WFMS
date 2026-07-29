import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { Avatar } from '../Avatar';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface SearchResultCardProps {
  employee: any;
  onPress: (employee: any) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ employee, onPress }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown Employee';
  const extraSkillsCount = (employee.totalSkills || 0) - (employee.primarySkills?.length || 0);

  return (
    <Card style={styles.card} onPress={() => onPress(employee)}>
      <View style={styles.header}>
        <Avatar name={fullName} uri={employee.profile_image} size={48} />
        <View style={styles.titleContainer}>
          <AppText variant="h2" numberOfLines={1}>{fullName}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
            {employee.designation || 'No designation'} · {employee.department || 'No department'}
          </AppText>
        </View>
      </View>

      <View style={[styles.statsRow, { backgroundColor: theme.colors.border }]}>
        <View style={styles.statBox}>
          <AppText variant="h3">{employee.totalSkills ?? 0}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>Skills</AppText>
        </View>
        <View style={styles.statBox}>
          <AppText variant="h3">{employee.averageProficiency ?? 0}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>Avg. Prof.</AppText>
        </View>
        <View style={styles.statBox}>
          <AppText variant="h3">{employee.certificationsCount ?? 0}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>Certs</AppText>
        </View>
      </View>

      {employee.primarySkills?.length > 0 && (
        <View style={styles.skillsRow}>
          {employee.primarySkills.map((skillName: string, index: number) => (
            <Chip key={index} style={[styles.chip, { backgroundColor: theme.colors.border }]} textStyle={styles.chipText} compact>
              {skillName}
            </Chip>
          ))}
          {extraSkillsCount > 0 && (
            <Chip style={[styles.chip, { backgroundColor: theme.colors.border }]} textStyle={styles.chipText} compact>
              +{extraSkillsCount} more
            </Chip>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
  },
});
