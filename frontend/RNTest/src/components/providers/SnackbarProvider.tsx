import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { lightTheme as theme } from '../../theme/theme';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<Props> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  const showSnackbar = (msg: string, snackType: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setType(snackType);
    setVisible(true);
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.textPrimary; // Dark background for info
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: getBackgroundColor() }}
        action={{
          label: 'Close',
          onPress: () => setVisible(false),
          color: theme.colors.surface,
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
