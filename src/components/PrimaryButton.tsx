import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { Theme } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'ink' | 'ochre';
  disabled?: boolean;
  loading?: boolean;
  glass?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'ink',
  disabled = false,
  loading = false,
  glass = false,
  style,
}: PrimaryButtonProps) {
  
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return Theme.colors.paperDim;
    
    if (glass) {
      if (variant === 'ochre') {
        return pressed ? 'rgba(201, 127, 43, 0.18)' : 'rgba(201, 127, 43, 0.07)';
      }
      return pressed ? 'rgba(47, 69, 56, 0.16)' : 'rgba(47, 69, 56, 0.06)';
    } else {
      if (variant === 'ochre') {
        return pressed ? Theme.colors.ochreDeep : Theme.colors.ochre;
      }
      return pressed ? 'rgba(47, 69, 56, 0.85)' : Theme.colors.ink;
    }
  };

  const getBorderColor = () => {
    if (!glass) return 'transparent';
    if (disabled) return Theme.colors.line;
    return variant === 'ochre' ? 'rgba(201, 127, 43, 0.28)' : 'rgba(47, 69, 56, 0.22)';
  };

  const getTextColor = () => {
    if (disabled) return Theme.colors.inkFaint;
    if (glass) {
      return variant === 'ochre' ? Theme.colors.ochre : Theme.colors.ink;
    }
    return Theme.colors.white;
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: glass ? 1.5 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.borderRadius.button,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    alignSelf: 'stretch',
    borderStyle: 'solid',
  },
  text: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    fontWeight: '700',
  },
});
