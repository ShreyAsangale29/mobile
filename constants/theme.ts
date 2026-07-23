/**
 * Exercise Buddy Theme
 */

import { Platform } from 'react-native';

// Primary Neon Accent
const tintColorLight = '#00E5D4';
const tintColorDark = '#00E5D4';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F7FA',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Custom
    card: '#FFFFFF',
    border: '#E5E7EB',
    secondaryText: '#6B7280',
    success: '#22C55E',
    warning: '#F97316',
    danger: '#EF4444',
  },

  dark: {
    text: '#FFFFFF',
    background: '#050505',
    tint: tintColorDark,
    icon: '#A1A1AA',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,

    // Custom
    card: '#111111',
    border: '#1F1F1F',
    secondaryText: '#A0A0A0',
    success: '#22C55E',
    warning: '#F97316',
    danger: '#EF4444',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Fitness App Design Tokens
 */

export const C = {
  bg: "#050505",
  card: '#111111',
  card2: '#171717',

  ink: '#FFFFFF',
  inkSoft: '#A0A0A0',

  brand: '#00E5D4',
  brand2: '#00B8A9',

  accent: '#22C55E',
  warn: '#F97316',
  danger: '#EF4444',

  xp: '#FFD700',
  streak: '#FF8C42',
  badge: '#00E5D4',

  progressBg: '#222222',
};

export const GOAL = 12;