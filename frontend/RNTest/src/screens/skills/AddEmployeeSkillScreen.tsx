import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Switch, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useCreateEmployeeSkill } from '../../hooks/useSkills';
import { SkillProficiencyRating } from '../../components/skills/SkillProficiencyRating';

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>Add New Skill</Text>
        
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Category ID (Temp)"
              value={value}
              onChangeText={onChange}
              error={!!errors.categoryId}
              style={styles.input}
            />
          )}
        />
        {errors.categoryId && <HelperText type="error">{errors.categoryId.message}</HelperText>}

        <Controller
          control={control}
          name="skillId"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Skill ID (Temp)"
              value={value}
              onChangeText={onChange}
              error={!!errors.skillId}
              style={styles.input}
            />
          )}
        />
        {errors.skillId && <HelperText type="error">{errors.skillId.message}</HelperText>}

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
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
        >
          Submit for Approval
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
