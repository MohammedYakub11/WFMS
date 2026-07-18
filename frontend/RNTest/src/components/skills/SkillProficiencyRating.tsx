import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';

interface Props {
  rating: number;
  maxRating?: number;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const SkillProficiencyRating = ({ rating, maxRating = 5, readonly = true, onRatingChange }: Props) => {
  const theme = useTheme();
  
  const handlePress = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return 'Novice';
      case 2: return 'Beginner';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unrated';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => (
          <TouchableOpacity
            key={index}
            disabled={readonly}
            onPress={() => handlePress(index + 1)}
          >
            <IconButton
              icon={index < rating ? 'star' : 'star-outline'}
              size={24}
              iconColor={index < rating ? theme.colors.primary : theme.colors.outline}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {getRatingLabel(rating)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 4,
  },
});
