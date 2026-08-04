import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setFilters, resetFilters } from '../../store/auditLogFiltersSlice';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { lightTheme, darkTheme } from '../../theme/theme';

interface AuditLogFiltersModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const MODULE_OPTIONS = [
  'AUTH',
  'EMPLOYEES',
  'SKILLS',
  'SKILL_CATEGORIES',
  'ROLES',
  'EMPLOYEE_ROLES',
  'NOTIFICATIONS',
  'EMPLOYEE_SKILLS',
];

export const AuditLogFiltersModal: React.FC<AuditLogFiltersModalProps> = ({ visible, onDismiss }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { module, action, dateFrom, dateTo } = useSelector((state: RootState) => state.auditLogFilters);

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
          <AppText variant="h2" style={styles.header}>Filter Audit Logs</AppText>

          <AppText variant="h3" style={styles.sectionTitle}>Module</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All', module === null, () => dispatch(setFilters({ module: null })))}
            {MODULE_OPTIONS.map((opt) =>
              renderChip(opt, module === opt, () => dispatch(setFilters({ module: opt })), opt),
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <AppText variant="h3" style={styles.sectionTitle}>Action</AppText>
          <AppTextField
            label=""
            placeholder="e.g. CREATE, UPDATE, LOGIN"
            value={action || ''}
            onChangeText={(text) => dispatch(setFilters({ action: text || null }))}
            autoCapitalize="characters"
          />

          <AppText variant="h3" style={styles.sectionTitle}>Date From</AppText>
          <AppTextField
            label=""
            placeholder="YYYY-MM-DD"
            value={dateFrom || ''}
            onChangeText={(text) => dispatch(setFilters({ dateFrom: text || null }))}
          />

          <AppText variant="h3" style={styles.sectionTitle}>Date To</AppText>
          <AppTextField
            label=""
            placeholder="YYYY-MM-DD"
            value={dateTo || ''}
            onChangeText={(text) => dispatch(setFilters({ dateTo: text || null }))}
          />

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
    marginBottom: 8,
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
