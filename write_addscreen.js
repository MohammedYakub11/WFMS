const fs = require('fs');

const addSkillScreen = `import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, HelperText, Snackbar, Portal, Dialog } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useSkillCategories, useSkills, useCreateEmployeeSkill } from '../../hooks/useSkills';
import { ProficiencyRating } from '../../components/skills/ProficiencyRating';

// Temporary until full auth
const CURRENT_EMPLOYEE_ID = 'CURRENT_USER_ID';

const schema = yup.object({
  categoryId: yup.string().required('Skill category is required'),
  skillId: yup.string().required('Skill is required'),
  proficiencyRating: yup.number().min(1, 'Please select a proficiency level').max(5).required(),
  yearsOfExperience: yup.number().typeError('Must be a number').min(0, 'Cannot be negative').nullable().transform((v, o) => (o === '' ? null : v)),
  lastUsedDate: yup.string().nullable().test('is-past', 'Date cannot be in the future', (value) => {
    if (!value) return true;
    return new Date(value) <= new Date();
  }),
  isCertified: yup.boolean().default(false),
  certificationName: yup.string().when('isCertified', {
    is: true,
    then: (schema) => schema.required('Certification name is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  issuingOrganization: yup.string().when('isCertified', {
    is: true,
    then: (schema) => schema.required('Issuing organization is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  issueDate: yup.string().when('isCertified', {
    is: true,
    then: (schema) => schema.required('Issue date is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  expiryDate: yup.string().nullable(),
  remarks: yup.string().max(500, 'Remarks cannot exceed 500 characters').nullable(),
});

type AddSkillFormData = yup.InferType<typeof schema>;

export const AddSkillScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  
  const { data: categoriesResponse } = useSkillCategories();
  const categories = categoriesResponse?.data?.data || [];

  const { data: skillsResponse } = useSkills();
  const allSkills = skillsResponse?.data?.data || [];

  const { mutateAsync: createSkill, isPending } = useCreateEmployeeSkill();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setValue
  } = useForm<AddSkillFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryId: '',
      skillId: '',
      proficiencyRating: 0,
      yearsOfExperience: null as any,
      lastUsedDate: '',
      isCertified: false,
      certificationName: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      remarks: '',
    },
  });

  const selectedCategoryId = watch('categoryId');
  const isCertified = watch('isCertified');

  const filteredSkills = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allSkills.filter((s: any) => s.categoryId === selectedCategoryId);
  }, [allSkills, selectedCategoryId]);

  useEffect(() => {
    // Reset skill if category changes
    setValue('skillId', '');
  }, [selectedCategoryId, setValue]);

  const onSubmit = async (data: AddSkillFormData) => {
    try {
      // Basic formatting before sending
      const payload: any = {
        employeeId: CURRENT_EMPLOYEE_ID,
        skillId: data.skillId,
        proficiencyRating: data.proficiencyRating,
      };

      if (data.yearsOfExperience !== null && data.yearsOfExperience !== undefined) {
        payload.yearsOfExperience = Number(data.yearsOfExperience);
      }
      
      if (data.lastUsedDate) payload.lastUsedDate = data.lastUsedDate;
      if (data.isCertified) {
        payload.isCertified = true;
        payload.certificationName = data.certificationName;
        payload.issuingOrganization = data.issuingOrganization;
        payload.issueDate = data.issueDate;
        if (data.expiryDate) payload.expiryDate = data.expiryDate;
      }
      if (data.remarks) payload.remarks = data.remarks;

      await createSkill(payload);
      
      setSnackbarMessage('Skill added successfully!');
      setSnackbarVisible(true);
      
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (err: any) {
      setSnackbarMessage(err?.response?.data?.message || 'Failed to add skill');
      setSnackbarVisible(true);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setCancelDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.header}>Add New Skill</Text>

        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              {/* Fallback to simple TextInputs since no Dropdown package was specified, but in production we'd use react-native-dropdown-picker */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.dropdownPlaceholder}>
                {categories.map((cat: any) => (
                  <Button 
                    key={cat.id} 
                    mode={value === cat.id ? 'contained' : 'outlined'} 
                    onPress={() => onChange(cat.id)}
                    style={{marginBottom: 4}}
                  >
                    {cat.categoryName}
                  </Button>
                ))}
              </View>
              {errors.categoryId && <HelperText type="error">{errors.categoryId.message}</HelperText>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="skillId"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill</Text>
              <View style={styles.dropdownPlaceholder}>
                {filteredSkills.map((skill: any) => (
                  <Button 
                    key={skill.id} 
                    mode={value === skill.id ? 'contained' : 'outlined'} 
                    onPress={() => onChange(skill.id)}
                    style={{marginBottom: 4}}
                  >
                    {skill.skillName}
                  </Button>
                ))}
                {selectedCategoryId && filteredSkills.length === 0 && (
                  <Text>No skills found in this category.</Text>
                )}
              </View>
              {errors.skillId && <HelperText type="error">{errors.skillId.message}</HelperText>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="proficiencyRating"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              <ProficiencyRating 
                value={value} 
                onChange={onChange} 
                error={errors.proficiencyRating?.message}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="yearsOfExperience"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputGroup}>
              <TextInput
                label="Years of Experience"
                mode="outlined"
                keyboardType="numeric"
                value={value ? String(value) : ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.yearsOfExperience}
              />
              {errors.yearsOfExperience && <HelperText type="error">{errors.yearsOfExperience.message}</HelperText>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="lastUsedDate"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputGroup}>
              <TextInput
                label="Last Used Date (YYYY-MM-DD)"
                mode="outlined"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. 2023-12-01"
                error={!!errors.lastUsedDate}
              />
              {errors.lastUsedDate && <HelperText type="error">{errors.lastUsedDate.message}</HelperText>}
            </View>
          )}
        />

        <View style={styles.switchGroup}>
          <Text variant="titleMedium">Certified?</Text>
          <Controller
            control={control}
            name="isCertified"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>

        {isCertified && (
          <View style={styles.certificationGroup}>
            <Controller
              control={control}
              name="certificationName"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  label="Certification Name *"
                  mode="outlined"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.certificationName}
                  style={styles.inputSpacing}
                />
              )}
            />
            {errors.certificationName && <HelperText type="error">{errors.certificationName.message}</HelperText>}

            <Controller
              control={control}
              name="issuingOrganization"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  label="Issuing Organization *"
                  mode="outlined"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.issuingOrganization}
                  style={styles.inputSpacing}
                />
              )}
            />
            {errors.issuingOrganization && <HelperText type="error">{errors.issuingOrganization.message}</HelperText>}

            <Controller
              control={control}
              name="issueDate"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  label="Issue Date (YYYY-MM-DD) *"
                  mode="outlined"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.issueDate}
                  style={styles.inputSpacing}
                />
              )}
            />
            {errors.issueDate && <HelperText type="error">{errors.issueDate.message}</HelperText>}

            <Controller
              control={control}
              name="expiryDate"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  label="Expiry Date (YYYY-MM-DD)"
                  mode="outlined"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.expiryDate}
                  style={styles.inputSpacing}
                />
              )}
            />
            {errors.expiryDate && <HelperText type="error">{errors.expiryDate.message}</HelperText>}
          </View>
        )}

        <Controller
          control={control}
          name="remarks"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputGroup}>
              <TextInput
                label="Remarks"
                mode="outlined"
                multiline
                numberOfLines={3}
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.remarks}
              />
              {errors.remarks && <HelperText type="error">{errors.remarks.message}</HelperText>}
            </View>
          )}
        />

        <View style={styles.buttonGroup}>
          <Button mode="outlined" onPress={handleCancel} style={styles.button} disabled={isPending}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button} loading={isPending} disabled={isPending}>
            Save
          </Button>
        </View>

      </ScrollView>

      <Portal>
        <Dialog visible={cancelDialogVisible} onDismiss={() => setCancelDialogVisible(false)}>
          <Dialog.Title>Discard Changes?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">You have unsaved changes. Are you sure you want to discard them?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>Keep Editing</Button>
            <Button onPress={() => {
              setCancelDialogVisible(false);
              navigation.goBack();
            }}>Discard</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownPlaceholder: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  certificationGroup: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputSpacing: {
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
  }
});
`;

fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', addSkillScreen);
console.log('Successfully wrote AddSkillScreen.tsx');
