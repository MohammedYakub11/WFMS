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
import { useBusinessUnit, useCreateBusinessUnit, useUpdateBusinessUnit } from '../../hooks/useBusinessUnits';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface BusinessUnitFormValues {
  name: string;
  description: string;
  isActive: boolean;
}

export const BusinessUnitFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const businessUnitId: string | undefined = route.params?.businessUnitId;
  const isEditMode = !!businessUnitId;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: existing, isLoading: isLoadingExisting } = useBusinessUnit(businessUnitId || '');
  const createMutation = useCreateBusinessUnit();
  const updateMutation = useUpdateBusinessUnit();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessUnitFormValues>({
    defaultValues: { name: '', description: '', isActive: true },
  });

  useEffect(() => {
    if (isEditMode && existing) {
      reset({ name: existing.name, description: existing.description || '', isActive: existing.isActive });
    }
  }, [isEditMode, existing, reset]);

  const onSubmit = async (data: BusinessUnitFormValues) => {
    const payload = { name: data.name, description: data.description || undefined, isActive: data.isActive };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: businessUnitId!, data: payload });
        showSnackbar('Business unit updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Business unit created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} business unit`, 'error');
    }
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Business Unit" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Business Unit' : 'Add Business Unit'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
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
            title={isEditMode ? 'Save Changes' : 'Create Business Unit'}
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
