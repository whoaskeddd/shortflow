import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingSplash } from "@/components/LoadingSplash";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { FeedScreen } from "@/screens/FeedScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { UploadScreen } from "@/screens/UploadScreen";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

import { getTabBarHeight } from "./tabBarLayout";

const Tab = createBottomTabNavigator();

const TAB_ICON_NAMES = {
  "Лента": { active: "home", inactive: "home-outline" },
  "Поиск": { active: "search", inactive: "search-outline" },
  "Публикация": { active: "add-circle", inactive: "add-circle-outline" },
  "Активность": { active: "notifications", inactive: "notifications-outline" },
  "Профиль": { active: "person", inactive: "person-outline" }
} as const;

export function RootNavigator() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.accessToken);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showSplash, setShowSplash] = useState(true);

  const tabBarHeight = getTabBarHeight(insets.bottom);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setShowSplash(false), 2200);
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
        detachInactiveScreens={false}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: tabBarHeight,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            elevation: 0
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            marginTop: 2
          },
          tabBarIcon: ({ color, focused, size }) => {
            const iconNames =
              TAB_ICON_NAMES[route.name as keyof typeof TAB_ICON_NAMES] ?? TAB_ICON_NAMES["Лента"];
            return (
              <Ionicons
                name={focused ? iconNames.active : iconNames.inactive}
                size={size}
                color={color}
              />
            );
          }
        })}
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
