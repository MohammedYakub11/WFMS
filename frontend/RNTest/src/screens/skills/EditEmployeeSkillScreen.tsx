import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEmployeeSkillDetail, useUpdateEmployeeSkill } from '../../hooks/useSkills';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { lightTheme as theme } from '../../theme/theme';

const schema = yup.object({
  proficiencyRating: yup.number().min(1, 'Please select a proficiency level').max(5).required(),
  yearsOfExperience: yup.number().typeError('Must be a number').min(0, 'Cannot be negative').nullable().transform((v, o) => (o === '' ? null : v)),
  lastUsedDate: yup.string().nullable(),
  isPrimary: yup.boolean(),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters').nullable(),
}).required();

export const EditEmployeeSkillScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id } = route.params;

  const { data: skillResponse, isLoading } = useEmployeeSkillDetail(id);
  const skill = skillResponse?.data;
  const updateMutation = useUpdateEmployeeSkill();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      proficiencyRating: 0,
      yearsOfExperience: null as number | null,
      lastUsedDate: '',
      isPrimary: false,
      notes: '',
    }
  });

  useEffect(() => {
    if (skill) {
      reset({
        proficiencyRating: skill.proficiencyRating || 0,
        yearsOfExperience: skill.yearsOfExperience || null,
        lastUsedDate: skill.lastUsedDate ? new Date(skill.lastUsedDate).toISOString() : '',
        isPrimary: skill.isPrimary || false,
        notes: skill.notes || '',
      });
    }
  }, [skill, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          ...data,
          status: 'PENDING_APPROVAL',
        },
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update skill:', error);
    }
  };

  if (isLoading) return <Loader style={styles.loader} />;
  if (!skill) return (
    <View style={styles.container}>
      <AppHeader title="Edit Skill" showBack />
      <EmptyState
        title="Skill Not Found"
        description="We couldn't find the skill you were trying to edit."
        actionTitle="Go Back"
        onAction={() => navigation.goBack()}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title={`Edit ${skill.skill?.skillName || skill.skill?.name || 'Skill'}`} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
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
            title="Save Changes" 
            onPress={handleSubmit(onSubmit)} 
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1 },
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
