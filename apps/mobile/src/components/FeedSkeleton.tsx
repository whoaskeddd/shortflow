import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getTabBarHeight } from "@/navigation/tabBarLayout";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FeedSkeleton() {
  const { colors } = useAppTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0.42)).current;
  const tabBarHeight = getTabBarHeight(insets.bottom);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.72,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          height,
          paddingTop: insets.top + 18,
          paddingBottom: tabBarHeight + 20
        }
      ]}
    >
      <Animated.View
        style={[styles.headerTitle, { opacity, backgroundColor: "rgba(208,180,118,0.18)" }]}
      />
      <View style={styles.content}>
        <Animated.View style={[styles.author, { opacity, backgroundColor: colors.border }]} />
        <Animated.View style={[styles.titleLong, { opacity, backgroundColor: "rgba(245,240,231,0.16)" }]} />
        <Animated.View style={[styles.titleShort, { opacity, backgroundColor: "rgba(245,240,231,0.12)" }]} />
        <Animated.View style={[styles.desc, { opacity, backgroundColor: "rgba(245,240,231,0.10)" }]} />
      </View>
      <View style={styles.rightRail}>
        <Animated.View style={[styles.avatar, { opacity, backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.action, { opacity, backgroundColor: colors.surfaceGlass }]} />
        <Animated.View style={[styles.action, { opacity, backgroundColor: colors.surfaceGlass }]} />
        <Animated.View style={[styles.action, { opacity, backgroundColor: colors.surfaceGlass }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between"
  },
  headerTitle: {
    alignSelf: "center",
    width: 112,
    height: 28,
    borderRadius: 14
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 34
  },
  author: {
    width: 142,
    height: 22,
    borderRadius: 12,
    marginBottom: 18
  },
  titleLong: {
    width: "78%",
    height: 30,
    borderRadius: 14,
    marginBottom: 10
  },
  titleShort: {
    width: "58%",
    height: 30,
    borderRadius: 14,
    marginBottom: 14
  },
  desc: {
    width: "70%",
    height: 18,
    borderRadius: 12
  },
  rightRail: {
    position: "absolute",
    right: 18,
    bottom: 126,
    alignItems: "center",
    gap: 14
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 999
  },
  action: {
    width: 52,
    height: 52,
    borderRadius: 20
  }
});
