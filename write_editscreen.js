const fs = require('fs');

const editSkillScreen = `import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Switch, useTheme, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEmployeeSkillDetail, useUpdateEmployeeSkill } from '../../hooks/useSkills';
import { ProficiencyRating } from '../../components/skills/ProficiencyRating';

const schema = yup.object().shape({
  proficiencyRating: yup.number().min(1, 'Please select a proficiency rating').max(5).required('Required'),
  yearsOfExperience: yup.number().typeError('Must be a number').min(0, 'Cannot be negative').max(50, 'Max 50 years allowed').nullable(),
  isCertified: yup.boolean().required(),
  certificationName: yup.string().when('isCertified', {
    is: true,
    then: (schema) => schema.required('Certification name is required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  issuingOrganization: yup.string().when('isCertified', {
    is: true,
    then: (schema) => schema.required('Issuing organization is required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  issueDate: yup.string().nullable(),
  expiryDate: yup.string().nullable(),
  lastUsedDate: yup.string().nullable(),
  remarks: yup.string().max(500, 'Max 500 characters allowed').nullable(),
});

export const EditSkillScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const skillId = route.params?.id;

  const { data: skillDetail, isLoading, isError } = useEmployeeSkillDetail(skillId);
  const updateMutation = useUpdateEmployeeSkill();

  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors, isDirty, isValid }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      proficiencyRating: 0,
      yearsOfExperience: null as number | null,
      isCertified: false,
      certificationName: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      lastUsedDate: '',
      remarks: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (skillDetail) {
      reset({
        proficiencyRating: skillDetail.proficiencyRating || 0,
        yearsOfExperience: skillDetail.yearsOfExperience || null,
        isCertified: skillDetail.isCertified || false,
        certificationName: skillDetail.certificationName || '',
        issuingOrganization: skillDetail.issuingOrganization || '',
        issueDate: skillDetail.issueDate ? String(skillDetail.issueDate).split('T')[0] : '',
        expiryDate: skillDetail.expiryDate ? String(skillDetail.expiryDate).split('T')[0] : '',
        lastUsedDate: skillDetail.lastUsedDate ? String(skillDetail.lastUsedDate).split('T')[0] : '',
        remarks: skillDetail.remarks || '',
      });
    }
  }, [skillDetail, reset]);

  // Dirty State Detection and Navigation Block
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty || saving) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure to discard them and leave the screen?',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, isDirty, saving]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    
    const payload = { ...data };
    
    // Clean payload for uncertified
    if (!payload.isCertified) {
      payload.certificationName = null;
      payload.issuingOrganization = null;
      payload.issueDate = null;
      payload.expiryDate = null;
    }

    // Convert date strings to empty nulls for DB
    if (!payload.issueDate) payload.issueDate = null;
    if (!payload.expiryDate) payload.expiryDate = null;
    if (!payload.lastUsedDate) payload.lastUsedDate = null;

    try {
      await updateMutation.mutateAsync({ id: skillId, data: payload });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update skill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !skillDetail) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Failed to load skill data.</Text>
      </View>
    );
  }

  const categoryName = (skillDetail.skill as any)?.category?.categoryName || 'Unknown';
  const skillName = skillDetail.skill?.skillName || 'Unknown';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={styles.title}>Edit Skill</Text>

        <TextInput
          label="Category"
          value={categoryName}
          disabled
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Skill"
          value={skillName}
          disabled
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.inputContainer}>
          <Text variant="titleMedium" style={styles.label}>Proficiency Rating *</Text>
          <Controller
            control={control}
            name="proficiencyRating"
            render={({ field: { onChange, value } }) => (
              <ProficiencyRating value={value} onChange={onChange} />
            )}
          />
          {errors.proficiencyRating && <Text style={styles.errorText}>{errors.proficiencyRating.message}</Text>}
        </View>

        <Controller
          control={control}
          name="yearsOfExperience"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Years of Experience"
              mode="outlined"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value != null ? value.toString() : ''}
              error={!!errors.yearsOfExperience}
              style={styles.input}
            />
          )}
        />
        {errors.yearsOfExperience && <Text style={styles.errorText}>{errors.yearsOfExperience.message}</Text>}

        <Controller
          control={control}
          name="lastUsedDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Last Used Date (YYYY-MM-DD)"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.lastUsedDate}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="isCertified"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchContainer}>
              <Text variant="bodyLarge">Is Certified?</Text>
              <Switch value={value} onValueChange={onChange} />
            </View>
          )}
        />

        <Controller
          control={control}
          name="isCertified"
          render={({ field: { value: isCertified } }) => (
            isCertified ? (
              <View style={styles.certContainer}>
                <Controller
                  control={control}
                  name="certificationName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Certification Name *"
                      mode="outlined"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.certificationName}
                      style={styles.input}
                    />
                  )}
                />
                {errors.certificationName && <Text style={styles.errorText}>{errors.certificationName.message}</Text>}

                <Controller
                  control={control}
                  name="issuingOrganization"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Issuing Organization *"
                      mode="outlined"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.issuingOrganization}
                      style={styles.input}
                    />
                  )}
                />
                {errors.issuingOrganization && <Text style={styles.errorText}>{errors.issuingOrganization.message}</Text>}

                <View style={styles.row}>
                  <Controller
                    control={control}
                    name="issueDate"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Issue Date"
                        mode="outlined"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="YYYY-MM-DD"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="expiryDate"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Expiry Date"
                        mode="outlined"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={[styles.input, { flex: 1, marginLeft: 8 }]}
                        placeholder="YYYY-MM-DD"
                      />
                    )}
                  />
                </View>
              </View>
            ) : <View />
          )}
        />

        <Controller
          control={control}
          name="remarks"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Remarks"
              mode="outlined"
              multiline
              numberOfLines={3}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.remarks}
              style={styles.input}
            />
          )}
        />
        {errors.remarks && <Text style={styles.errorText}>{errors.remarks.message}</Text>}

        <Button 
          mode="contained" 
          onPress={handleSubmit(onSubmit)} 
          style={styles.submitButton}
          loading={saving}
          disabled={saving || !isDirty}
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
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  certContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 40,
    paddingVertical: 6,
  }
});
`;

fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\EditSkillScreen.tsx', editSkillScreen);
console.log('Successfully wrote EditSkillScreen.tsx');
