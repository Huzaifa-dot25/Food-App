/**
 * Jest test setup file.
 * Runs before every test suite.
 */

// Mock expo-secure-store (not available in Node.js test env)
jest.mock('expo-secure-store', () => ({
  setItemAsync:    jest.fn(() => Promise.resolve()),
  getItemAsync:    jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: 'http://localhost:5001/api',
      },
    },
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter:             () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams:  () => ({}),
  usePathname:           () => '/',
  Link:                  ({ children }: any) => children,
  Redirect:              () => null,
  Stack:                 { Screen: () => null },
  Tabs:                  { Screen: () => null },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync:           jest.fn(() => Promise.resolve({
    coords: { latitude: 24.86, longitude: 67.01 },
  })),
  Accuracy: { Balanced: 3 },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler:         jest.fn(),
  addNotificationReceivedListener:jest.fn(() => ({ remove: jest.fn() })),
  requestPermissionsAsync:        jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync:          jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test]' })),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default:    { show: jest.fn(), hide: jest.fn() },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => name,
}));

// Silence React Native animation warnings in tests
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Silence act() warnings for async state updates
global.console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('act(')) return;
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
  console.warn(...args);
};
