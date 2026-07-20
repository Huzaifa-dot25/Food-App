/**
 * 4pt spacing scale — consistent throughout the entire app.
 */
export const Spacing = {
  0:   0,
  0.5: 2,
  1:   4,
  1.5: 6,
  2:   8,
  2.5: 10,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
} as const;

export const BorderRadius = {
  none:  0,
  sm:    4,
  md:    8,
  lg:    12,
  xl:    16,
  '2xl': 20,
  '3xl': 24,
  full:  9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const Layout = {
  screenPaddingH: Spacing[4],  // horizontal padding for all screens
  screenPaddingV: Spacing[4],  // vertical padding for all screens
  cardRadius:     BorderRadius.xl,
  buttonHeight:   52,
  inputHeight:    52,
  tabBarHeight:   64,
  headerHeight:   56,
} as const;
