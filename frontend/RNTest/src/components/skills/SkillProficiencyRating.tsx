import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText';
import { AppIcon } from '../AppIcon';
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

  // Plain TouchableOpacity + AppIcon instead of react-native-paper's
  // IconButton: Paper's IconButton carries its own fixed minimum hit-target
  // padding (~40-48dp per star regardless of the `size` prop), so 5 of them
  // needed 200dp+ of width — comfortably wider than the ~100-140dp column
  // this renders inside on the Skill Card, and since views don't clip
  // overflow by default, the excess visually spilled into the neighboring
  // "Experience" column. `hitSlop` grows the tappable area invisibly instead
  // of the star's visual/layout size, so touch targets stay accessible in
  // the interactive (non-readonly) rating-input screens without widening
  // the row.
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
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <AppIcon
                name={isFilled ? 'star' : 'star-outline'}
                size={size}
                color={isFilled ? currentInfo.color : theme.colors.border}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <AppText
        variant="caption"
        numberOfLines={1}
        style={{ color: currentInfo.color, fontFamily: theme.typography.fontFamily.semiBold }}
      >
        {currentInfo.label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});
