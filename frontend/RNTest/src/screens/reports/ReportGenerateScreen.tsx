import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, Menu } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { Card } from '../../components/Cards';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { usePermissions } from '../../hooks/usePermissions';
import { useGenerateAndDownloadReport } from '../../hooks/useReports';
import { resetFilters, setFilters } from '../../store/reportFiltersSlice';
import { REPORT_TYPE_OPTIONS, ReportFilters, ReportFormat, ReportType } from '../../types/reports';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

type FilterField = keyof ReportFilters;

const FIELDS_BY_TYPE: Record<ReportType, FilterField[]> = {
  employees: ['department', 'designation', 'location', 'dateFrom', 'dateTo'],
  skills: ['skillCategoryId', 'dateFrom', 'dateTo'],
  departments: ['department', 'location'],
  designations: ['designation', 'department'],
  locations: ['location', 'department'],
  workforce_analytics: ['department', 'designation', 'location'],
  audit_logs: ['employeeId', 'dateFrom', 'dateTo'],
  skill_approvals: ['approvalStatus', 'employeeId', 'skillId', 'dateFrom', 'dateTo'],
  certifications: ['certificationStatus', 'employeeId', 'skillId'],
};

const FIELD_LABELS: Record<FilterField, string> = {
  dateFrom: 'Date From (YYYY-MM-DD)',
  dateTo: 'Date To (YYYY-MM-DD)',
  department: 'Department',
  designation: 'Designation',
  employeeId: 'Employee ID',
  skillId: 'Skill ID',
  skillCategoryId: 'Skill Category ID',
  approvalStatus: 'Approval Status',
  certificationStatus: 'Certification Status',
  location: 'Location',
};

const APPROVAL_STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'changes_requested'];
const CERTIFICATION_STATUS_OPTIONS = ['certified', 'not_certified'];

export const ReportGenerateScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const reportType: ReportType = route.params?.reportType;
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const filtersState = useSelector((state: RootState) => state.reportFilters);
  const [menuVisible, setMenuVisible] = useState(false);
  const generateMutation = useGenerateAndDownloadReport();

  const option = REPORT_TYPE_OPTIONS.find((o) => o.type === reportType);
  const fields = useMemo(() => FIELDS_BY_TYPE[reportType] || [], [reportType]);

  useEffect(() => {
    dispatch(resetFilters());
  }, [reportType, dispatch]);

  const filters: ReportFilters = useMemo(() => {
    const result: ReportFilters = {};
    fields.forEach((field) => {
      const value = filtersState[field];
      if (value) result[field] = value;
    });
    return result;
  }, [fields, filtersState]);

  const handleFieldChange = (field: FilterField, value: string) => {
    dispatch(setFilters({ [field]: value || null }));
  };

  const handlePreview = () => {
    navigation.navigate('ReportPreview', { reportType, filters });
  };

  const handleGenerateAndDownload = (format: ReportFormat) => {
    setMenuVisible(false);
    generateMutation.mutate(
      { reportType, format, filters },
      {
        onSuccess: () => showSnackbar('Report ready to share', 'success'),
        onError: () => showSnackbar('Failed to generate report. Please try again.', 'error'),
      },
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={option?.label ?? 'Generate Report'} showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>Filters</AppText>
          {fields.length === 0 && (
            <AppText variant="caption" color={theme.colors.textSecondary}>
              This report has no additional filters.
            </AppText>
          )}
          {fields.map((field) =>
            field === 'approvalStatus' || field === 'certificationStatus' ? (
              <View key={field} style={styles.chipField}>
                <AppText variant="inputLabel" weight="medium" color={theme.colors.textSecondary} style={styles.chipLabel}>
                  {FIELD_LABELS[field]}
                </AppText>
                <View style={styles.chipRow}>
                  {(field === 'approvalStatus' ? APPROVAL_STATUS_OPTIONS : CERTIFICATION_STATUS_OPTIONS).map((opt) => (
                    <Chip
                      key={opt}
                      selected={filtersState[field] === opt}
                      onPress={() => handleFieldChange(field, filtersState[field] === opt ? '' : opt)}
                      style={styles.chip}
                    >
                      {opt.replace('_', ' ')}
                    </Chip>
                  ))}
                </View>
              </View>
            ) : (
              <AppTextField
                key={field}
                label={FIELD_LABELS[field]}
                value={filtersState[field] || ''}
                onChangeText={(value) => handleFieldChange(field, value)}
              />
            ),
          )}
        </Card>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
        <SecondaryButton title="Preview" onPress={handlePreview} style={styles.footerButton} />
        {hasPermission('EXPORT_REPORTS') && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <PrimaryButton
                title={generateMutation.isPending ? 'Generating…' : 'Generate & Download'}
                onPress={() => setMenuVisible(true)}
                disabled={generateMutation.isPending}
                style={styles.footerButton}
              />
            }
          >
            <Menu.Item title="Download as CSV" onPress={() => handleGenerateAndDownload('csv')} />
            <Menu.Item title="Download as Excel" onPress={() => handleGenerateAndDownload('xlsx')} />
            <Menu.Item title="Download as PDF" onPress={() => handleGenerateAndDownload('pdf')} />
          </Menu>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 16 },
  chipField: { marginBottom: 16 },
  chipLabel: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginRight: 4, marginBottom: 4 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  footerButton: { flex: 1 },
});
