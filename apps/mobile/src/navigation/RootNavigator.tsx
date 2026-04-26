import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { LoadingSplash } from "@/components/LoadingSplash";
import { FeedScreen } from "@/screens/FeedScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { UploadScreen } from "@/screens/UploadScreen";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  const { colors } = useAppTheme();
  const token = useAuthStore((state) => state.accessToken);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setShowSplash(false), 1800);
    return () => globalThis.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <LoadingSplash />;
  }

  if (!token) {
    return mode === "login" ? (
      <LoginScreen onRegisterPress={() => setMode("register")} />
    ) : (
      <RegisterScreen onLoginPress={() => setMode("login")} />
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          primary: colors.primary,
          text: colors.text,
          border: colors.border
        }
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: "transparent",
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 14,
            height: 74,
            borderRadius: 28,
            paddingTop: 8,
            paddingBottom: 10,
            elevation: 0
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700"
          }
        }}
      >
        <Tab.Screen name="Лента" component={FeedScreen} />
        <Tab.Screen name="Поиск" component={SearchScreen} />
        <Tab.Screen name="Публикация" component={UploadScreen} />
        <Tab.Screen name="Активность" component={NotificationsScreen} />
        <Tab.Screen name="Профиль" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
