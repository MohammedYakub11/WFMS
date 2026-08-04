import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { useCategoryAdmin, useCreateCategoryAdmin, useUpdateCategoryAdmin } from '../../hooks/useCategoriesAdmin';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { CategorySchema } from '../../validations/skills.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const CategoryFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId: string | undefined = route.params?.categoryId;
  const isEditMode = !!categoryId;

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: category, isLoading: isCategoryLoading } = useCategoryAdmin(categoryId || '');
  const createMutation = useCreateCategoryAdmin();
  const updateMutation = useUpdateCategoryAdmin();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CategorySchema),
    defaultValues: {
      categoryName: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isEditMode && category) {
      reset({
        categoryName: category.categoryName,
        description: category.description || '',
      });
    }
  }, [isEditMode, category, reset]);

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, description: data.description || undefined };
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: categoryId!, data: payload });
        showSnackbar('Category updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Category created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} category`, 'error');
    }
  };

  if (isEditMode && isCategoryLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Category" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Category' : 'Add Category'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Category Details</AppText>
            <Controller
              control={control}
              name="categoryName"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Category Name" value={value} onChangeText={onChange} error={errors.categoryName?.message} />
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
            title={isEditMode ? 'Save Changes' : 'Create Category'}
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 16 },
  multiline: { height: 96, paddingTop: 12 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
