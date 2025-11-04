import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import TrpcProvider from "@repo/trpc/TrpcProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <TrpcProvider
        url={
          Platform.OS === "android"
            ? process.env.EXPO_PUBLIC_TRPC_URL_ANDROID!
            : process.env.EXPO_PUBLIC_TRPC_URL!
        }
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "CRUD",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </TrpcProvider>
    </ThemeProvider>
  );
}
