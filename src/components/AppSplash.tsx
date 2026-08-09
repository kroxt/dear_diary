import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Theme } from '../constants/theme';

interface AppSplashProps {
  onFinish: () => void;
}

export default function AppSplash({ onFinish }: AppSplashProps) {
  const featherScale = useRef(new Animated.Value(0.6)).current;
  const featherOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const poweredOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Feather pops in
      Animated.parallel([
        Animated.spring(featherScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(featherOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline + powered-by fade in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(poweredOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 4. Hold for a beat
      Animated.delay(700),
      // 5. Fade the whole screen out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Feather icon */}
      <Animated.Text
        style={[
          styles.feather,
          {
            opacity: featherOpacity,
            transform: [{ scale: featherScale }],
          },
        ]}
      >
        🪶
      </Animated.Text>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
          },
        ]}
      >
        Dear Diary
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your pages, your story.
      </Animated.Text>

      {/* Powered by */}
      <Animated.View style={[styles.poweredByRow, { opacity: poweredOpacity }]}>
        <Text style={styles.poweredByText}>Powered by </Text>
        <Text style={styles.poweredByBrand}>Kroxt BaaS</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Theme.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  feather: {
    fontSize: 72,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontFamily: Theme.fonts.display,
    fontSize: Theme.fontSizes.xxl,
    fontWeight: '700',
    color: Theme.colors.ink,
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
  },
  tagline: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.inkFaint,
    marginBottom: Theme.spacing.xxl,
  },
  poweredByRow: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  poweredByText: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.inkFaint,
    opacity: 0.6,
  },
  poweredByBrand: {
    fontFamily: Theme.fonts.body,
    fontSize: Theme.fontSizes.xs,
    fontWeight: 'bold',
    color: Theme.colors.inkFaint,
    opacity: 0.6,
  },
});
