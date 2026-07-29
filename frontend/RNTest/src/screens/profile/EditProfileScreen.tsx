import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEmployeeProfile, useUpdateEmployeeProfile } from '../../hooks/useEmployee';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme as theme } from '../../theme/theme';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { Avatar } from '../../components/Avatar';

const schema = yup.object().shape({
  phone: yup.string(),
  about_me: yup.string().max(500, 'Maximum 500 characters allowed'),
  address: yup.string(),
  linkedin_url: yup.string().url('Must be a valid URL'),
});

export const EditProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useEmployeeProfile(user?.id || '');
  const { mutateAsync: updateProfile, isPending } = useUpdateEmployeeProfile();
  const navigation = useNavigation();
  const { showSnackbar } = useSnackbar();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: profile?.phone || '',
      about_me: profile?.profile_metadata?.about_me || '',
      address: profile?.profile_metadata?.address || '',
      linkedin_url: profile?.profile_metadata?.linkedin_url || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile({
        id: user!.id,
        data: {
          phone: data.phone,
          profile_metadata: {
            ...profile?.profile_metadata,
            about_me: data.about_me,
            address: data.address,
            linkedin_url: data.linkedin_url,
          }
        }
      });
      showSnackbar('Profile updated successfully', 'success');
      navigation.goBack();
    } catch {
      showSnackbar('Failed to update profile', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Edit Profile" showBack showAvatar={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Avatar 
            name={`${profile?.first_name} ${profile?.last_name}`} 
            uri={profile?.profile_image} 
            size={100} 
            showEditIcon
            onPress={() => Alert.alert('Coming Soon', 'Image upload will be supported in the next phase.')}
          />
        </View>

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone Number"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.phone}
              style={styles.input}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Address"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.address}
              style={styles.input}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          )}
        />

        <Controller
          control={control}
          name="linkedin_url"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="LinkedIn URL"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.linkedin_url}
              style={styles.input}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          )}
        />

        <Controller
          control={control}
          name="about_me"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="About Me"
              mode="outlined"
              multiline
              numberOfLines={4}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.about_me}
              style={[styles.input, styles.textArea]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          )}
        />

      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Save Changes" 
          onPress={handleSubmit(onSubmit)} 
          isLoading={isPending}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    minHeight: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
