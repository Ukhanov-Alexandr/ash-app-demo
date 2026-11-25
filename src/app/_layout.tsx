import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { StoreProvider } from "@/lib/store";

SplashScreen.preventAutoHideAsync(); // прячется в StoreProvider, когда состояние прочитано

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          primary: theme.accent,
          background: theme.background,
          card: theme.background,
        },
      }}
    >
      <StoreProvider>
        <View style={Platform.OS === "web" ? styles.webFrame : styles.flex}>
          <Stack
            screenOptions={{
              headerBackButtonDisplayMode: "minimal",
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="delivery"
              options={{ title: "Как получить заказ" }}
            />
            <Stack.Screen name="checkout" options={{ title: "Оформление" }} />
            <Stack.Screen name="login" options={{ title: "Вход" }} />
          </Stack>
        </View>
        <StatusBar style="auto" />
      </StoreProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // В браузере на широком экране держим ширину телефона, иначе макет расползается.
  webFrame: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center" },
});
