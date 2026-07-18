import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEmployeeSkillDetail, useUpdateEmployeeSkill } from '../../hooks/useSkills';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';

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

  const { data: skill, isLoading } = useEmployeeSkillDetail(id);
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

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (!skill) return <Text style={{ padding: 16 }}>Skill not found.</Text>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>Edit {skill.skill?.name}</Text>

        <View style={styles.ratingContainer}>
          <Text variant="titleMedium">Proficiency Rating</Text>
          <Controller
            control={control}
            name="proficiencyRating"
            render={({ field: { onChange, value } }) => (
              <SkillProficiencyRating
                rating={value}
                readonly={false}
                onRatingChange={onChange}
              />
            )}
          />
          {errors.proficiencyRating && <HelperText type="error">{errors.proficiencyRating.message}</HelperText>}
        </View>

        <Controller
          control={control}
          name="yearsOfExperience"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Years of Experience"
              value={value ? String(value) : ''}
              onChangeText={onChange}
              keyboardType="numeric"
              error={!!errors.yearsOfExperience}
              style={styles.input}
            />
          )}
        />
        {errors.yearsOfExperience && <HelperText type="error">{errors.yearsOfExperience.message}</HelperText>}

        <View style={styles.switchContainer}>
          <Text variant="bodyLarge">Set as Primary Skill</Text>
          <Controller
            control={control}
            name="isPrimary"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Notes"
              value={value || ''}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              error={!!errors.notes}
              style={styles.input}
            />
          )}
        />
        {errors.notes && <HelperText type="error">{errors.notes.message}</HelperText>}

        <Button 
          mode="contained" 
          onPress={handleSubmit(onSubmit)} 
          style={styles.button}
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
        >
          Save Changes
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  ratingContainer: {
    marginVertical: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    marginTop: 24,
  },
});
