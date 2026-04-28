import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
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
      <View style={[styles.glow, styles.topGlow, { backgroundColor: colors.glow }]} />
      <View style={[styles.glow, styles.bottomGlow, { backgroundColor: "rgba(208,180,118,0.10)" }]} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    overflow: "hidden"
  },
  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999
  },
  topGlow: {
    top: -150,
    right: -120
  },
  bottomGlow: {
    bottom: -170,
    left: -130
  }
});
