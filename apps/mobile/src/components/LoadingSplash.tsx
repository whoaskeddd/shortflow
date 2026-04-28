import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/theme/ThemeProvider";

export function LoadingSplash() {
  const { colors } = useAppTheme();
  const [step, setStep] = useState(0);
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const messages = [
    "Готовим спокойную персональную ленту",
    "Синхронизируем профиль и активность",
    "Настраиваем плавный просмотр видео"
  ];

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      Animated.sequence([
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ]).start();
      setStep((current) => (current + 1) % messages.length);
    }, 1800);
    return () => globalThis.clearInterval(timer);
  }, [messageOpacity, messages.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.glow, { backgroundColor: colors.glow }]} />
      <LinearGradient
        colors={["rgba(208,180,118,0.34)", "rgba(20,18,15,0.02)"]}
        style={styles.halo}
      />
      <Text style={[styles.brand, { color: colors.text }]}>ShortFlow</Text>
      <Animated.Text style={[styles.message, { color: colors.textSecondary, opacity: messageOpacity }]}>
        {messages[step]}
      </Animated.Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    opacity: 0.42
  },
  halo: {
    width: 118,
    height: 118,
    borderRadius: 999,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(208,180,118,0.22)"
  },
  brand: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 10
  },
  message: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 24
  }
});
