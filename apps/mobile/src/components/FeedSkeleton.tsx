import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getTabBarHeight } from "@/navigation/tabBarLayout";
import { useAppTheme } from "@/theme/ThemeProvider";

export function FeedSkeleton() {
  const { colors } = useAppTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0.45)).current;
  const tabBarHeight = getTabBarHeight(insets.bottom);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.74,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 1100,
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
          backgroundColor: "#090B12",
          height,
          paddingTop: insets.top + 18,
          paddingBottom: tabBarHeight + 20
        }
      ]}
    >
      <Animated.View
        style={[styles.headerTitle, { opacity, backgroundColor: "rgba(255,255,255,0.14)" }]}
      />
      <View style={styles.content}>
        <Animated.View style={[styles.author, { opacity, backgroundColor: "rgba(255,255,255,0.22)" }]} />
        <Animated.View style={[styles.titleLong, { opacity, backgroundColor: "rgba(255,255,255,0.2)" }]} />
        <Animated.View style={[styles.titleShort, { opacity, backgroundColor: "rgba(255,255,255,0.16)" }]} />
        <Animated.View style={[styles.desc, { opacity, backgroundColor: "rgba(255,255,255,0.14)" }]} />
      </View>
      <View style={styles.rightRail}>
        <Animated.View style={[styles.avatar, { opacity, backgroundColor: colors.accent }]} />
        <Animated.View style={[styles.action, { opacity, backgroundColor: "rgba(255,255,255,0.16)" }]} />
        <Animated.View style={[styles.action, { opacity, backgroundColor: "rgba(255,255,255,0.16)" }]} />
        <Animated.View style={[styles.action, { opacity, backgroundColor: "rgba(255,255,255,0.16)" }]} />
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
    width: 120,
    height: 28,
    borderRadius: 14
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  author: {
    width: 150,
    height: 22,
    borderRadius: 12,
    marginBottom: 18
  },
  titleLong: {
    width: "84%",
    height: 34,
    borderRadius: 14,
    marginBottom: 10
  },
  titleShort: {
    width: "62%",
    height: 34,
    borderRadius: 14,
    marginBottom: 14
  },
  desc: {
    width: "72%",
    height: 18,
    borderRadius: 12
  },
  rightRail: {
    position: "absolute",
    right: 16,
    bottom: 124,
    alignItems: "center",
    gap: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999
  },
  action: {
    width: 58,
    height: 58,
    borderRadius: 24
  }
});
