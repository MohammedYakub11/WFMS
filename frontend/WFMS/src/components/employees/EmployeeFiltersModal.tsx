import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setFilters, resetFilters } from '../../store/employeeDirectorySlice';
import { useSearchMetadata } from '../../hooks/useSearch';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { lightTheme, darkTheme } from '../../theme/theme';

interface EmployeeFiltersModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const EmployeeFiltersModal: React.FC<EmployeeFiltersModalProps> = ({ visible, onDismiss }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { department, designation, status, location } = useSelector(
    (state: RootState) => state.employeeDirectory,
  );
  const { data: metadata } = useSearchMetadata();
  const departments: string[] = metadata?.departments || [];
  const designations: string[] = metadata?.designations || [];
  const locations: string[] = metadata?.locations || [];

  const renderChip = (label: string, isSelected: boolean, onPress: () => void, key?: string) => (
    <TouchableOpacity
      key={key ?? label}
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: theme.colors.border },
        isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
      ]}
    >
      <AppText
        variant="caption"
        color={isSelected ? theme.colors.primaryButtonText : theme.colors.textSecondary}
        weight="semiBold"
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppText variant="h2" style={styles.header}>Filter Employees</AppText>

          <AppText variant="h3" style={styles.sectionTitle}>Status</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All', status === null, () => dispatch(setFilters({ status: null })))}
            {STATUS_OPTIONS.map((opt) =>
              renderChip(opt.label, status === opt.value, () => dispatch(setFilters({ status: opt.value })), opt.value),
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <AppText variant="h3" style={styles.sectionTitle}>Department</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All', department === null, () => dispatch(setFilters({ department: null })))}
            {departments.map((dept) => renderChip(dept, department === dept, () => dispatch(setFilters({ department: dept })), dept))}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <AppText variant="h3" style={styles.sectionTitle}>Designation</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All', designation === null, () => dispatch(setFilters({ designation: null })))}
            {designations.map((d) => renderChip(d, designation === d, () => dispatch(setFilters({ designation: d })), d))}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <AppText variant="h3" style={styles.sectionTitle}>Location</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All', location === null, () => dispatch(setFilters({ location: null })))}
            {locations.map((loc) => renderChip(loc, location === loc, () => dispatch(setFilters({ location: loc })), loc))}
          </View>

          <View style={styles.actionContainer}>
            <View style={styles.actionButton}>
              <SecondaryButton title="Clear All" onPress={() => dispatch(resetFilters())} />
            </View>
            <View style={styles.actionButton}>
              <PrimaryButton title="Apply" onPress={onDismiss} />
            </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    margin: 20,
    maxHeight: '85%',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
});
