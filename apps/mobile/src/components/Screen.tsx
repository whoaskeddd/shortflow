import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/ThemeProvider";

export function Screen({
  children,
  style,
  edges = ["top", "left", "right"]
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ("top" | "right" | "bottom" | "left")[];
}) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.base, { backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  }
});
