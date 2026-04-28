import React from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppTheme } from "@/theme/ThemeProvider";

export function PrimaryButton({
  title,
  onPress,
  muted = false
}: {
  title: string;
  onPress: () => void;
  muted?: boolean;
}) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.shadow,
            {
              borderRadius: radius.md,
              opacity: pressed ? 0.94 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }]
            }
          ]}
        >
          <LinearGradient
            colors={
              muted
                ? ["rgba(255,255,255,0.08)", "rgba(185,155,88,0.08)"]
                : [colors.accent, colors.primary, colors.mutedGold]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              {
                borderColor: muted ? colors.border : "rgba(245,240,231,0.18)",
                borderRadius: radius.md,
                paddingVertical: spacing.sm + 2
              }
            ]}
          >
            <Text style={[styles.label, { color: muted ? colors.text : "#11100B" }]}>
              {title}
            </Text>
          </LinearGradient>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#B99B58",
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  label: {
    fontSize: 16,
    fontWeight: "800"
  }
});
