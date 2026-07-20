import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RecipientPickerModal } from '../../components/notifications/RecipientPickerModal';
import { useSendNotification } from '../../hooks/useNotifications';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { broadcastSchema } from '../../validations/notification.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

type BroadcastType = 'SYSTEM_ANNOUNCEMENT' | 'SECURITY_ALERT';
type BroadcastTarget = 'all' | 'selected';

interface BroadcastFormValues {
  title: string;
  message: string;
  type: BroadcastType;
  target: BroadcastTarget;
  employeeIds: string[];
}

export const SendNotificationScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const sendMutation = useSendNotification();

  const [isRecipientPickerVisible, setIsRecipientPickerVisible] = useState(false);
  const [isConfirmAllVisible, setIsConfirmAllVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: yupResolver(broadcastSchema) as any,
    defaultValues: {
      title: '',
      message: '',
      type: 'SYSTEM_ANNOUNCEMENT',
      target: 'all',
      employeeIds: [],
    },
  });

  const type = watch('type');
  const target = watch('target');
  const employeeIds = watch('employeeIds');

  const styles = createStyles(theme);

  const submitBroadcast = async (data: BroadcastFormValues) => {
    try {
      const result = await sendMutation.mutateAsync({
        title: data.title,
        message: data.message,
        type: data.type,
        target: data.target,
        employeeIds: data.target === 'selected' ? data.employeeIds : undefined,
      });
      showSnackbar(`Notification sent to ${result.sent} employee(s)`, 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to send notification', 'error');
    } finally {
      setIsConfirmAllVisible(false);
    }
  };

  const onSubmit = (data: BroadcastFormValues) => {
    if (data.target === 'all') {
      setIsConfirmAllVisible(true);
      return;
    }
    submitBroadcast(data);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Send Notification" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Message</AppText>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Title" value={value} onChangeText={onChange} error={errors.title?.message} />
              )}
            />
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Message"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  style={styles.multilineField}
                  error={errors.message?.message}
                />
              )}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Type</AppText>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  { backgroundColor: type === 'SYSTEM_ANNOUNCEMENT' ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setValue('type', 'SYSTEM_ANNOUNCEMENT')}
              >
                <AppText
                  variant="caption"
                  color={type === 'SYSTEM_ANNOUNCEMENT' ? theme.colors.surface : theme.colors.textPrimary}
                  weight={type === 'SYSTEM_ANNOUNCEMENT' ? 'semiBold' : 'regular'}
                >
                  Announcement
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  { backgroundColor: type === 'SECURITY_ALERT' ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setValue('type', 'SECURITY_ALERT')}
              >
                <AppText
                  variant="caption"
                  color={type === 'SECURITY_ALERT' ? theme.colors.surface : theme.colors.textPrimary}
                  weight={type === 'SECURITY_ALERT' ? 'semiBold' : 'regular'}
                >
                  Security Alert
                </AppText>
              </TouchableOpacity>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Recipients</AppText>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  { backgroundColor: target === 'all' ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setValue('target', 'all')}
              >
                <AppText
                  variant="caption"
                  color={target === 'all' ? theme.colors.surface : theme.colors.textPrimary}
                  weight={target === 'all' ? 'semiBold' : 'regular'}
                >
                  All Employees
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleChip,
                  { backgroundColor: target === 'selected' ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setValue('target', 'selected')}
              >
                <AppText
                  variant="caption"
                  color={target === 'selected' ? theme.colors.surface : theme.colors.textPrimary}
                  weight={target === 'selected' ? 'semiBold' : 'regular'}
                >
                  Selected Employees
                </AppText>
              </TouchableOpacity>
            </View>

            {target === 'selected' && (
              <>
                <TouchableOpacity
                  style={[styles.recipientsButton, { borderColor: theme.colors.border }]}
                  onPress={() => setIsRecipientPickerVisible(true)}
                >
                  <AppText>{`Choose Recipients (${employeeIds.length} selected)`}</AppText>
                </TouchableOpacity>
                {errors.employeeIds && (
                  <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
                    {errors.employeeIds.message}
                  </AppText>
                )}
              </>
            )}
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title="Send Notification"
            onPress={handleSubmit(onSubmit)}
            isLoading={sendMutation.isPending}
            disabled={sendMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      <RecipientPickerModal
        visible={isRecipientPickerVisible}
        onDismiss={() => setIsRecipientPickerVisible(false)}
        initialSelectedIds={employeeIds}
        onConfirm={(ids) => setValue('employeeIds', ids, { shouldValidate: true })}
      />

      <ConfirmationDialog
        visible={isConfirmAllVisible}
        title="Notify all employees"
        message="This will notify ALL employees. Continue?"
        confirmLabel="Send"
        isLoading={sendMutation.isPending}
        onConfirm={handleSubmit(submitBroadcast)}
        onDismiss={() => setIsConfirmAllVisible(false)}
      />
    </View>
  );
};

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    sectionCard: { marginBottom: 16 },
    sectionTitle: { marginBottom: 16 },
    multilineField: { height: 100, alignItems: 'flex-start', paddingVertical: 12 },
    toggleRow: {
      flexDirection: 'row',
      gap: 8,
    },
    toggleChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
    },
    recipientsButton: {
      marginTop: 12,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 14,
    },
    errorText: {
      marginTop: 4,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
    },
  });
