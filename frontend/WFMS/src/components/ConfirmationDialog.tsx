import React from 'react';
import { Portal, Dialog } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isLoading = false,
  onConfirm,
  onDismiss,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.l }}
      >
        <Dialog.Content>
          <AppText variant="h2" style={{ marginBottom: 12 }}>{title}</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>{message}</AppText>
        </Dialog.Content>
        <Dialog.Actions style={{ gap: 12, paddingHorizontal: 24, paddingBottom: 16 }}>
          <SecondaryButton title={cancelLabel} onPress={onDismiss} />
          <PrimaryButton
            title={confirmLabel}
            onPress={onConfirm}
            isLoading={isLoading}
            style={destructive ? { backgroundColor: theme.colors.error } : undefined}
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
