import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export type MoodType = 'happy' | 'neutral' | 'sad';

interface MoodChipProps {
  mood: MoodType;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function MoodChip({ mood, label, selected, onPress }: MoodChipProps) {
  let moodColor: string = Theme.colors.moodNeutral;
  if (mood === 'happy') {
    moodColor = Theme.colors.moodHappy;
  } else if (mood === 'sad') {
    moodColor = Theme.colors.moodSad;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: moodColor,
          backgroundColor: selected ? moodColor : 'transparent',
          opacity: pressed ? 0.8 : 1.0,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? Theme.colors.white : moodColor,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: Theme.borderRadius.pill,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  text: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    fontWeight: '600',
  },
});
