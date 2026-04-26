import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "@/theme/ThemeProvider";

export function PrimaryButton({
  title,
  onPress
}: {
  title: string;
  onPress: () => void;
}) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          opacity: pressed ? 0.86 : 1
        }
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  }
});
