import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { useEmployees } from '../../hooks/useEmployee';
import { EmployeeListItem } from '../../types/employees';

interface EmployeePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (employee: EmployeeListItem) => void;
  excludeEmployeeId?: string;
}

export const EmployeePickerModal: React.FC<EmployeePickerModalProps> = ({
  visible,
  onDismiss,
  onSelect,
  excludeEmployeeId,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [search, setSearch] = useState('');

  const { data, isLoading } = useEmployees({ keyword: search || undefined, limit: 20 });
  const results = (data?.items || []).filter((e: EmployeeListItem) => e.id !== excludeEmployeeId);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l }]}
      >
        <AppText variant="h2" style={styles.header}>Select Reporting Manager</AppText>
        <AppTextField
          label=""
          placeholder="Search employees..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchField}
        />
        {isLoading ? (
          <AppText color={theme.colors.textSecondary} style={styles.emptyText}>Loading...</AppText>
        ) : results.length === 0 ? (
          <AppText color={theme.colors.textSecondary} style={styles.emptyText}>No employees found.</AppText>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderBottomColor: theme.colors.divider }]}
                onPress={() => {
                  onSelect(item);
                  onDismiss();
                }}
              >
                <AppText weight="semiBold">{item.first_name} {item.last_name}</AppText>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  {item.designation || 'No designation'} · {item.department || '—'}
                </AppText>
              </TouchableOpacity>
            )}
          />
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    margin: 20,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
  },
  searchField: {
    marginBottom: 12,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
  },
});
