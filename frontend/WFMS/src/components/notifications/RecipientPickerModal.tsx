import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Modal, Portal, Checkbox } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { PrimaryButton } from '../PrimaryButton';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { useEmployees } from '../../hooks/useEmployee';
import { EmployeeListItem } from '../../types/employees';

interface RecipientPickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialSelectedIds?: string[];
  onConfirm: (employeeIds: string[]) => void;
}

export const RecipientPickerModal: React.FC<RecipientPickerModalProps> = ({
  visible,
  onDismiss,
  initialSelectedIds = [],
  onConfirm,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));

  useEffect(() => {
    if (visible) {
      setSelectedIds(new Set(initialSelectedIds));
      setSearch('');
    }
    // Only re-sync when the modal opens, not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { data, isLoading } = useEmployees({ keyword: search || undefined, limit: 20 });
  const results = data?.items || [];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDone = () => {
    onConfirm(Array.from(selectedIds));
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l },
        ]}
      >
        <AppText variant="h2" style={styles.header}>Select Recipients</AppText>
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
            renderItem={({ item }: { item: EmployeeListItem }) => (
              <TouchableOpacity
                style={[styles.row, { borderBottomColor: theme.colors.divider }]}
                onPress={() => toggleSelect(item.id)}
              >
                <Checkbox
                  status={selectedIds.has(item.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggleSelect(item.id)}
                />
                <AppText weight="semiBold" style={styles.rowText}>
                  {item.first_name} {item.last_name}
                </AppText>
                <AppText variant="caption" color={theme.colors.textSecondary} style={styles.rowSubtext}>
                  {item.designation || 'No designation'} · {item.department || '—'}
                </AppText>
              </TouchableOpacity>
            )}
          />
        )}
        <PrimaryButton
          title={`Done (${selectedIds.size} selected)`}
          onPress={handleDone}
          style={styles.doneButton}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  rowText: {
    marginRight: 8,
  },
  rowSubtext: {
    width: '100%',
    marginLeft: 40,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
  },
  doneButton: {
    marginTop: 16,
  },
});
