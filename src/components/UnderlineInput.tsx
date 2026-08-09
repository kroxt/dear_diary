import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../constants/theme';

interface UnderlineInputProps extends TextInputProps {
  label?: string;
  error?: string;
  activeColor?: string;
}

export default function UnderlineInput({
  label,
  error,
  activeColor = Theme.colors.ochre,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...props
}: UnderlineInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const bottomBorderColor = error
    ? Theme.colors.danger
    : isFocused
    ? activeColor
    : Theme.colors.line;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderBottomColor: bottomBorderColor,
              color: Theme.colors.ink,
              paddingRight: secureTextEntry ? 40 : 0,
            },
            style,
          ]}
          placeholderTextColor={Theme.colors.inkFaint}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color={Theme.colors.inkFaint}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
    alignSelf: 'stretch',
  },
  label: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.inkFaint,
    marginBottom: Theme.spacing.xs,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  input: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 2,
    backgroundColor: 'transparent',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    padding: Theme.spacing.xs,
  },
  errorText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.danger,
    marginTop: Theme.spacing.xs,
  },
});
