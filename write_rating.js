const fs = require('fs');

const proficiencyRating = `import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ProficiencyRatingProps {
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
  error?: string;
}

export const ProficiencyRating = React.memo(({ 
  value, 
  onChange, 
  maxStars = 5,
  error 
}: ProficiencyRatingProps) => {
  const theme = useTheme();

  const getLabel = (level: number) => {
    switch(level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Select Proficiency';
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>Proficiency Level</Text>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isSelected = starValue <= value;
          return (
            <TouchableOpacity
              key={starValue}
              onPress={() => onChange(starValue)}
              style={[
                styles.starButton,
                isSelected ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surfaceVariant }
              ]}
            >
              <Text style={[styles.starText, isSelected && { color: theme.colors.onPrimary }]}>
                {starValue}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.footerRow}>
        <Text variant="bodyMedium" style={{ color: value > 0 ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
          {getLabel(value)}
        </Text>
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  starButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: {
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
`;

fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\skills\\ProficiencyRating.tsx', proficiencyRating);
console.log('Successfully wrote ProficiencyRating.tsx');
