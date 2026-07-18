import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';
import { AppTextField, AppTextFieldProps } from './AppTextField';
import { AppText } from './AppText';

export const PasswordField: React.FC<AppTextFieldProps> = (props) => {
  const [isSecure, setIsSecure] = useState(true);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <AppTextField
      {...props}
      secureTextEntry={isSecure}
      rightIcon={
        <TouchableOpacity onPress={toggleSecureEntry} style={styles.iconContainer}>
          <AppText variant="caption" color={theme.colors.primary}>
            {isSecure ? 'SHOW' : 'HIDE'}
          </AppText>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 4,
  },
});
