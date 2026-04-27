import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/theme/ThemeProvider";

export function LoadingSplash() {
  const { colors } = useAppTheme();
  const [step, setStep] = useState(0);
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const messages = [
    "Готовим ленту коротких видео",
    "Подключаем профиль, поиск и активность",
    "Собираем мобильный опыт как в TikTok"
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
      <View style={[styles.glow, { backgroundColor: "rgba(10,132,255,0.16)" }]} />
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
    width: 116,
    height: 116,
    borderRadius: 999,
    marginBottom: 24
  },
  brand: {
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 10
  },
  message: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 24
  }
});
