import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { useSkillAdmin, useCreateSkillAdmin, useUpdateSkillAdmin } from '../../hooks/useSkillsAdmin';
import { useSkillCategories } from '../../hooks/useSkills';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { SkillSchema } from '../../validations/skills.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { SkillCategory } from '../../types/skills';

export const SkillFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const skillId: string | undefined = route.params?.skillId;
  const isEditMode = !!skillId;

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: skill, isLoading: isSkillLoading } = useSkillAdmin(skillId || '');
  const { data: categoriesData } = useSkillCategories();
  const categories: SkillCategory[] = categoriesData?.items || [];

  const createMutation = useCreateSkillAdmin();
  const updateMutation = useUpdateSkillAdmin();
  const mutation = isEditMode ? updateMutation : createMutation;

  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SkillSchema),
    defaultValues: {
      categoryId: '',
      skillName: '',
      skillCode: '',
      requiredCertification: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isEditMode && skill) {
      reset({
        categoryId: skill.categoryId,
        skillName: skill.skillName,
        skillCode: skill.skillCode || '',
        requiredCertification: skill.requiredCertification || '',
        description: skill.description || '',
      });
      setCategoryName(skill.category?.categoryName || null);
    }
  }, [isEditMode, skill, reset]);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        requiredCertification: data.requiredCertification || undefined,
        description: data.description || undefined,
      };
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: skillId!, data: payload });
        showSnackbar('Skill updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Skill created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} skill`;
      if (error?.response?.status === 409) {
        setError('skillCode', { type: 'manual', message });
      }
      showSnackbar(message, 'error');
    }
  };

  if (isEditMode && isSkillLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Skill" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Skill' : 'Add Skill'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Skill Details</AppText>
            <Controller
              control={control}
              name="skillName"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Skill Name" value={value} onChangeText={onChange} error={errors.skillName?.message} />
              )}
            />
            <Controller
              control={control}
              name="skillCode"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Skill Code"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="characters"
                  error={errors.skillCode?.message}
                />
              )}
            />
            <View style={styles.pickerField}>
              <AppText variant="inputLabel" color={theme.colors.textSecondary} style={styles.pickerLabel}>
                Category
              </AppText>
              <TouchableOpacity
                style={[styles.pickerButton, { borderColor: errors.categoryId ? theme.colors.error : theme.colors.border }]}
                onPress={() => setIsCategoryPickerVisible(true)}
              >
                <AppText>{categoryName || 'Select a category'}</AppText>
              </TouchableOpacity>
              {errors.categoryId && (
                <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
                  {errors.categoryId.message}
                </AppText>
              )}
            </View>
            <Controller
              control={control}
              name="requiredCertification"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Required Certification (optional)"
                  value={value || ''}
                  onChangeText={onChange}
                  error={errors.requiredCertification?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Description (optional)"
                  value={value || ''}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  style={styles.multiline}
                  error={errors.description?.message}
                />
              )}
            />
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title={isEditMode ? 'Save Changes' : 'Create Skill'}
            onPress={handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      <Portal>
        <Modal
          visible={isCategoryPickerVisible}
          onDismiss={() => setIsCategoryPickerVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l }]}
        >
          <AppText variant="h2" style={styles.modalHeader}>Select Category</AppText>
          {categories.length === 0 ? (
            <AppText color={theme.colors.textSecondary} style={styles.emptyText}>No categories available.</AppText>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.row, { borderBottomColor: theme.colors.divider }]}
                  onPress={() => {
                    setValue('categoryId', item.id, { shouldValidate: true });
                    setCategoryName(item.categoryName);
                    setIsCategoryPickerVisible(false);
                  }}
                >
                  <AppText weight="semiBold">{item.categoryName}</AppText>
                </TouchableOpacity>
              )}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 16 },
  pickerField: { marginTop: 4, marginBottom: 16 },
  pickerLabel: { marginBottom: 8 },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  errorText: { marginTop: 4 },
  multiline: { height: 96, paddingTop: 12 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  modalContainer: {
    padding: 24,
    margin: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 16,
    textAlign: 'center',
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
