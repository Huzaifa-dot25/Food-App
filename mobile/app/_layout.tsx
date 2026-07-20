import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { store } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';

export default function RootLayout() {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
            <Stack.Screen name="(owner)"    options={{ headerShown: false }} />
            <Stack.Screen name="(rider)"    options={{ headerShown: false }} />
            <Stack.Screen name="(admin)"    options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
