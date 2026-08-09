import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../constants/theme';

interface RubberStampBadgeProps {
  icon: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
  rotation?: number; // e.g. -6
  style?: StyleProp<ViewStyle>;
}

export default function RubberStampBadge({
  icon,
  size = 32,
  color = Theme.colors.ochre,
  rotation = -6,
  style,
}: RubberStampBadgeProps) {
  const badgeSize = size * 1.8;
  
  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: color,
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          transform: [{ rotate: `${rotation}deg` }],
        },
        style,
      ]}
    >
      <Feather name={icon} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
