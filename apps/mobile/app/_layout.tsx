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
import TrpcProvider from "@repo/trpc/trpc-provider";
import { LoggerProvider } from "@repo/ui/logger-provider";
import { FlagExtensions, LogLevel } from "@repo/utils-core";

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
        <LoggerProvider
          logLevel={FlagExtensions.fromStringList(
            process.env.EXPO_PUBLIC_LOG_LEVELS,
            LogLevel,
          )}
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
          </Stack>
          <StatusBar style="auto" />
        </LoggerProvider>
      </TrpcProvider>
    </ThemeProvider>
  );
}
