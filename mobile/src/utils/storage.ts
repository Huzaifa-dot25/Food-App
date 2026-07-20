import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN:  'fd_access_token',
  REFRESH_TOKEN: 'fd_refresh_token',
  USER:          'fd_user',
} as const;

/**
 * Secure token storage using Expo SecureStore.
 * Values are AES-256 encrypted on-device.
 */
export const storage = {
  async setAccessToken(token: string)  { await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN,  token); },
  async setRefreshToken(token: string) { await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token); },
  async setUser(user: object)          { await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user)); },

  async getAccessToken()  { return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN); },
  async getRefreshToken() { return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN); },
  async getUser<T>(): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(KEYS.USER);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async clearAll() {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER);
  },
};
