import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import AppSplash from "../components/AppSplash";
import { Theme } from "../constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide the native Expo Go splash immediately so our in-app one takes over
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.paperDim,
          },
          headerTintColor: Theme.colors.ink,
          headerTitleStyle: {
            fontFamily: Theme.fonts.display,
            fontWeight: 'bold',
            fontSize: Theme.fontSizes.lg,
          },
          contentStyle: {
            backgroundColor: Theme.colors.paper,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="otp"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="list"
          options={{
            title: 'Dear Diary',
            headerLeft: () => null, // Disables back button from entry list to OTP
            headerBackVisible: false,
            gestureEnabled: false, // Disables swipe back on iOS
          }}
        />
        <Stack.Screen
          name="new"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="detail"
          options={{
            title: 'Diary Entry',
          }}
        />
      </Stack>
      {showSplash && <AppSplash onFinish={() => setShowSplash(false)} />}
    </>
  );
}
