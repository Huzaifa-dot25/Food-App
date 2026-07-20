import { StyleSheet } from 'react-native';

export const FontFamily = {
  regular:  'System',
  medium:   'System',
  semiBold: 'System',
  bold:     'System',
} as const;

export const FontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    16,
  lg:    18,
  xl:    20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
} as const;

export const Typography = StyleSheet.create({
  h1: {
    fontSize:   FontSize['4xl'],
    fontWeight: '700',
    lineHeight: FontSize['4xl'] * LineHeight.tight,
  },
  h2: {
    fontSize:   FontSize['3xl'],
    fontWeight: '700',
    lineHeight: FontSize['3xl'] * LineHeight.tight,
  },
  h3: {
    fontSize:   FontSize['2xl'],
    fontWeight: '600',
    lineHeight: FontSize['2xl'] * LineHeight.tight,
  },
  h4: {
    fontSize:   FontSize.xl,
    fontWeight: '600',
    lineHeight: FontSize.xl * LineHeight.normal,
  },
  h5: {
    fontSize:   FontSize.lg,
    fontWeight: '600',
    lineHeight: FontSize.lg * LineHeight.normal,
  },
  body1: {
    fontSize:   FontSize.base,
    fontWeight: '400',
    lineHeight: FontSize.base * LineHeight.normal,
  },
  body2: {
    fontSize:   FontSize.sm,
    fontWeight: '400',
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  caption: {
    fontSize:   FontSize.xs,
    fontWeight: '400',
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  label: {
    fontSize:   FontSize.sm,
    fontWeight: '500',
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  button: {
    fontSize:   FontSize.base,
    fontWeight: '600',
    lineHeight: FontSize.base * LineHeight.normal,
  },
});
