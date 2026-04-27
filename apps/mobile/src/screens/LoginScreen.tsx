import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAuthStore } from "@/store/auth";
import { useAppTheme } from "@/theme/ThemeProvider";

export function LoginScreen({ onRegisterPress }: { onRegisterPress: () => void }) {
  const { colors, spacing, radius } = useAppTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Попробуйте еще раз";
      Alert.alert(
        "Ошибка входа",
        message === "Invalid credentials" ? "Неверная почта или пароль." : message
      );
    }
  };

  return (
    <Screen>
      <View style={[styles.container, { padding: spacing.lg }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>ShortFlow</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Короткие видео в мобильной ленте.
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Войдите, чтобы открыть ленту, профиль, активность и инструменты автора.
        </Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Почта"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: radius.md
            }
          ]}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          secureTextEntry
          placeholder="Пароль"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              borderRadius: radius.md
            }
          ]}
          value={password}
          onChangeText={setPassword}
        />
        <PrimaryButton title={loading ? "Входим..." : "Войти"} onPress={submit} />
        <Text onPress={onRegisterPress} style={[styles.link, { color: colors.accent }]}>
          Нет аккаунта? Создать
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16
  },
  eyebrow: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6
  },
  title: {
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  link: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600"
  }
});
