import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, Typography } from '../lib/constants';
import { WaterStoreProvider } from '../hooks/useWaterStore';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are ready
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <WaterStoreProvider>
      <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontFamily: Typography.fonts.semibold,
              fontSize: Typography.sizes.body,
            },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Thirsty',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Einstellungen',
              presentation: 'modal',
              headerTitleStyle: {
                fontFamily: Typography.fonts.semibold,
                fontSize: Typography.sizes.body,
              },
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              title: 'Verlauf',
              headerTitleStyle: {
                fontFamily: Typography.fonts.semibold,
                fontSize: Typography.sizes.body,
              },
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </WaterStoreProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
