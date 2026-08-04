import React from 'react';
import { View, StyleSheet, Image, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { lightTheme as theme } from '../theme/theme';
import { NeuIconCircle } from './Cards';
import { AppIcon } from './AppIcon';

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
      <NeuIconCircle size={size} contentStyle={styles.neuAvatarInner}>
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <AppText style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</AppText>
          </View>
        )}
      </NeuIconCircle>
      
      {showEditIcon && (
        <View style={styles.editIconContainer}>
          <NeuIconCircle size={24} contentStyle={styles.editIconInner}>
            <AppIcon name="pencil" size={12} color={theme.colors.surface} />
          </NeuIconCircle>
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
  neuAvatarInner: {
    overflow: 'hidden',
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
    bottom: -4,
    right: -4,
  },
  editIconInner: {
    backgroundColor: theme.colors.primary,
  },
});
