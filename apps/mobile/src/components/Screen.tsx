import React from "react";
import { SafeAreaView, StyleSheet, ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/ThemeProvider";

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useAppTheme();

  return <SafeAreaView style={[styles.base, { backgroundColor: colors.background }, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  }
});
