import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useCreateEmployeeSkill } from '../../hooks/useSkills';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { lightTheme as theme } from '../../theme/theme';

const schema = yup.object({
  categoryId: yup.string().required('Skill category is required'),
  skillId: yup.string().required('Skill is required'),
  proficiencyRating: yup.number().min(1, 'Please select a proficiency level').max(5).required(),
  yearsOfExperience: yup.number().typeError('Must be a number').min(0, 'Cannot be negative').nullable().transform((v, o) => (o === '' ? null : v)),
  lastUsedDate: yup.string().nullable(),
  isPrimary: yup.boolean(),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters').nullable(),
}).required();

export const AddEmployeeSkillScreen = () => {
  const navigation = useNavigation();
  const createMutation = useCreateEmployeeSkill();
  const user = useSelector((state: RootState) => state.auth.user);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryId: '',
      skillId: '',
      proficiencyRating: 0,
      yearsOfExperience: null as number | null,
      lastUsedDate: '',
      isPrimary: false,
      notes: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        employeeId: user?.id,
        status: 'PENDING_APPROVAL',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create skill:', error);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Add New Skill" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Skill Details</AppText>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Category ID"
                  placeholder="Enter category ID"
                  value={value}
                  onChangeText={onChange}
                  error={errors.categoryId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="skillId"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Skill ID"
                  placeholder="Enter skill ID"
                  value={value}
                  onChangeText={onChange}
                  error={errors.skillId?.message}
                />
              )}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Experience & Rating</AppText>
            
            <View style={styles.ratingContainer}>
              <AppText variant="inputLabel" style={styles.ratingLabel}>Proficiency Rating</AppText>
              <Controller
                control={control}
                name="proficiencyRating"
                render={({ field: { onChange, value } }) => (
                  <SkillProficiencyRating
                    rating={value}
                    readonly={false}
                    onRatingChange={onChange}
                    size={32}
                  />
                )}
              />
              {errors.proficiencyRating && (
                <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
                  {errors.proficiencyRating.message}
                </AppText>
              )}
            </View>

            <Controller
              control={control}
              name="yearsOfExperience"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Years of Experience"
                  placeholder="e.g. 3"
                  value={value ? String(value) : ''}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.yearsOfExperience?.message}
                />
              )}
            />

            <View style={styles.switchContainer}>
              <AppText variant="bodyText" style={{ color: theme.colors.textPrimary }}>Set as Primary Skill</AppText>
              <Controller
                control={control}
                name="isPrimary"
                render={({ field: { onChange, value } }) => (
                  <Switch value={value || false} onValueChange={onChange} color={theme.colors.primary} />
                )}
              />
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Additional Information</AppText>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Notes"
                  placeholder="Add any additional details or context..."
                  value={value || ''}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                  error={errors.notes?.message}
                />
              )}
            />
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton 
            title="Submit for Approval" 
            onPress={handleSubmit(onSubmit)} 
            isLoading={createMutation.isPending}
            disabled={createMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: theme.colors.primary,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  errorText: {
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  textArea: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
});
