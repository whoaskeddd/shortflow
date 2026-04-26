import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/theme/ThemeProvider";

const { height } = Dimensions.get("window");

export function FeedSkeleton() {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, { backgroundColor: "#090B12" }]}>
      <Animated.View style={[styles.topTabs, { opacity, backgroundColor: "rgba(255,255,255,0.14)" }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.chip, { opacity, backgroundColor: "rgba(255,255,255,0.16)" }]} />
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
    height,
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 84
  },
  topTabs: {
    alignSelf: "center",
    width: 224,
    height: 46,
    borderRadius: 18
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  chip: {
    width: 78,
    height: 30,
    borderRadius: 999,
    marginBottom: 16
  },
  author: {
    width: 150,
    height: 22,
    borderRadius: 12,
    marginBottom: 14
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
    bottom: 112,
    alignItems: "center",
    gap: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999
  },
  action: {
    width: 82,
    height: 58,
    borderRadius: 24
  }
});
