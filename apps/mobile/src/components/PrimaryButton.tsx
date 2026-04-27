import React from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

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
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              opacity: pressed ? 0.94 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }]
            }
          ]}
        >
          <Text style={styles.label}>{title}</Text>
        </Animated.View>
      )}
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
