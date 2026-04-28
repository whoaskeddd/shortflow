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
        <View style={styles.hero}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>ShortFlow</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Видео-лента в спокойном премиальном ритме.
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Войдите, чтобы открыть персональную ленту, профиль и инструменты автора.
          </Text>
        </View>
        <View
          style={[
            styles.form,
            {
              backgroundColor: colors.surfaceGlass,
              borderColor: colors.border,
              borderRadius: radius.xl
            }
          ]}
        >
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Почта"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
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
                backgroundColor: colors.input,
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 24
  },
  hero: {
    gap: 12
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 39,
    letterSpacing: 0
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24
  },
  form: {
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16
  },
  link: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700"
  }
});
