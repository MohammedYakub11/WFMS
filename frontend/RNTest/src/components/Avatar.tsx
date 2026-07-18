import React from 'react';
import { View, StyleSheet, Image, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { lightTheme as theme } from '../theme/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  showEditIcon?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 48, style, onPress, showEditIcon }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const Container = onPress || showEditIcon ? TouchableOpacity : View;

  return (
    <Container style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <AppText style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</AppText>
        </View>
      )}
      
      {showEditIcon && (
        <View style={styles.editIconContainer}>
          <View style={styles.editIconInner}>
            <AppText style={styles.editIconText}>📷</AppText>
          </View>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: theme.colors.surface,
  },
  placeholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: theme.colors.surface,
    fontFamily: theme.typography.fontFamily.bold,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  editIconInner: {
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 12,
  },
});
