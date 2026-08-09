import { Platform } from 'react-native';

export const Theme = {
  colors: {
    paper: '#F1EAD8',        // main background
    paperDim: '#E7DEC6',     // secondary/dim background
    ink: '#2F4538',          // primary text, primary buttons, icons
    inkFaint: '#5C6E5E',     // secondary text, placeholders, hints
    ochre: '#C97F2B',        // accent color, used sparingly (secondary CTAs, links, active states)
    ochreDeep: '#A5651C',    // pressed/darker accent state
    moodHappy: '#C97F2B',
    moodNeutral: '#8E8267',
    moodSad: '#5B6B8C',
    danger: '#8C3A2B',       // errors, destructive actions
    line: 'rgba(47, 69, 56, 0.18)', // hairline dividers, input underlines
    white: '#FFFDF8',        // card surfaces, text on dark fills
  },
  fonts: {
    display: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Georgia, serif',
      default: 'serif',
    }),
    body: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: 'system-ui, sans-serif',
      default: 'sans-serif',
    }),
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 26,
    xxl: 32,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    button: 10,
    card: 8,
    pill: 20,
  }
} as const;
