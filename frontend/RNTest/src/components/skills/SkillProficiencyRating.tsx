import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AppText } from '../AppText';
import { lightTheme as theme } from '../../theme/theme';
import { ProficiencyColors } from '../../theme/colors';

interface Props {
  rating: number;
  maxRating?: number;
  readonly?: boolean;
  size?: number;
  onRatingChange?: (rating: number) => void;
}

export const SkillProficiencyRating = ({ rating, maxRating = 5, readonly = true, size = 24, onRatingChange }: Props) => {
  const handlePress = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const getRatingInfo = (val: number) => {
    switch (val) {
      case 1: return { label: 'Novice', color: ProficiencyColors.beginner };
      case 2: return { label: 'Beginner', color: ProficiencyColors.basic };
      case 3: return { label: 'Intermediate', color: ProficiencyColors.intermediate };
      case 4: return { label: 'Advanced', color: ProficiencyColors.advanced };
      case 5: return { label: 'Expert', color: ProficiencyColors.expert };
      default: return { label: 'Unrated', color: ProficiencyColors.noKnowledge };
    }
  };

  const currentInfo = getRatingInfo(rating);

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const isFilled = index < rating;
          return (
            <TouchableOpacity
              key={index}
              disabled={readonly}
              onPress={() => handlePress(index + 1)}
              activeOpacity={0.7}
            >
              <IconButton
                icon={isFilled ? 'star' : 'star-outline'}
                size={size}
                iconColor={isFilled ? currentInfo.color : theme.colors.border}
                style={styles.star}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <AppText variant="caption" style={{ color: currentInfo.color, fontFamily: theme.typography.fontFamily.semiBold }}>
        {currentInfo.label}
      </AppText>
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
    marginLeft: -12, // adjust for IconButton default padding
  },
  star: {
    margin: 0,
    padding: 0,
  },
});
