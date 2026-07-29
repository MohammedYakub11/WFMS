import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { useCreateDesignation, useDesignation, useUpdateDesignation } from '../../hooks/useDesignations';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface DesignationFormValues {
  designationCode: string;
  name: string;
  level: string;
  description: string;
  isActive: boolean;
}

export const DesignationFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const designationId: string | undefined = route.params?.designationId;
  const isEditMode = !!designationId;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: existing, isLoading: isLoadingExisting } = useDesignation(designationId || '');
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DesignationFormValues>({
    defaultValues: { designationCode: '', name: '', level: '0', description: '', isActive: true },
  });

  useEffect(() => {
    if (isEditMode && existing) {
      reset({
        designationCode: existing.designationCode,
        name: existing.name,
        level: String(existing.level),
        description: existing.description || '',
        isActive: existing.isActive,
      });
    }
  }, [isEditMode, existing, reset]);

  const onSubmit = async (data: DesignationFormValues) => {
    const payload = {
      designationCode: data.designationCode,
      name: data.name,
      level: parseInt(data.level, 10) || 0,
      description: data.description || undefined,
      isActive: data.isActive,
    };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: designationId!, data: payload });
        showSnackbar('Designation updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Designation created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} designation`, 'error');
    }
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Designation" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Designation' : 'Add Designation'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Controller
              control={control}
              name="designationCode"
              rules={{ required: 'Designation code is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Designation Code" value={value} onChangeText={onChange} error={errors.designationCode?.message} />
              )}
            />
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="level"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Seniority Level" value={value} onChangeText={onChange} keyboardType="numeric" />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Description (optional)" value={value} onChangeText={onChange} multiline numberOfLines={3} />
              )}
            />
            <View style={styles.switchRow}>
              <AppText weight="medium">Active</AppText>
              <Controller
                control={control}
                name="isActive"
                render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} />}
              />
            </View>
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title={isEditMode ? 'Save Changes' : 'Create Designation'}
            onPress={handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});
